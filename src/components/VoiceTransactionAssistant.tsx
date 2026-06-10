import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, X, CheckCircle2, AlertCircle, Loader2, Play, HelpCircle } from 'lucide-react';
import { db } from '../db';
import type { ExpenseCategory, EarningCategory } from '../db';
import { formatCurrency } from '../utils';

function getLevenshteinDistance(a: string, b: string): number {
  const tmp: number[][] = [];
  for (let i = 0; i <= a.length; i++) {
    tmp[i] = [i];
  }
  for (let j = 0; j <= b.length; j++) {
    tmp[0][j] = j;
  }
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      tmp[i][j] = Math.min(
        tmp[i - 1][j] + 1, // deletion
        tmp[i][j - 1] + 1, // insertion
        tmp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1) // substitution
      );
    }
  }
  return tmp[a.length][b.length];
}

function getStringSimilarity(s1: string, s2: string): number {
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  if (longer.length === 0) {
    return 1.0;
  }
  return (longer.length - getLevenshteinDistance(longer, shorter)) / longer.length;
}

const normalizeAndStem = (text: string): string[] => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 0)
    .map(w => {
      if (w.length <= 3) return w;
      if (w.endsWith('ies')) return w.slice(0, -3) + 'y';
      if (w.endsWith('es')) return w.slice(0, -2);
      if (w.endsWith('s') && !w.endsWith('ss')) return w.slice(0, -1);
      return w;
    });
};

const getAltPhrases = (catName: string): string[] => {
  const parts = catName.split(/[-:\/()\[\]]/).map(p => p.trim().toLowerCase()).filter(p => p.length > 0);
  if (parts.length > 1) {
    return [catName.toLowerCase(), ...parts];
  }
  return [catName.toLowerCase()];
};

interface VoiceTransactionAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  expenseCategories: ExpenseCategory[];
  earningCategories: EarningCategory[];
}

type AssistantStatus =
  | 'idle'
  | 'listening'
  | 'processing'
  | 'success'
  | 'error'
  | 'unsupported'
  | 'ambiguous';

interface AmbiguityInfo {
  expenseCategory: ExpenseCategory;
  earningCategory: EarningCategory;
  amount: number;
  calculationExpr?: string;
  isRemoval?: boolean;
}

export function VoiceTransactionAssistant({
  isOpen,
  onClose,
  expenseCategories,
  earningCategories,
}: VoiceTransactionAssistantProps) {
  const [status, setStatus] = useState<AssistantStatus>('idle');
  const [transcript, setTranscript] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successInfo, setSuccessInfo] = useState<{
    categoryName: string;
    type: 'expense' | 'earning';
    amount: number;
    isUpdate: boolean;
    oldAmount?: number;
    newAmount?: number;
    isDeleted?: boolean;
  } | null>(null);

  const [ambiguityInfo, setAmbiguityInfo] = useState<AmbiguityInfo | null>(null);

  const recognitionRef = useRef<any>(null);
  const autoCloseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setStatus('unsupported');
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = 'en-IN'; // Standard Indian English, supports standard accents & number inputs well

    rec.onstart = () => {
      setStatus('listening');
      setTranscript('');
      setErrorMessage('');
      setSuccessInfo(null);
      setAmbiguityInfo(null);
    };

    rec.onresult = (event: any) => {
      let currentResult = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        currentResult += event.results[i][0].transcript;
      }
      setTranscript(currentResult);
    };

    rec.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        setErrorMessage('Microphone access denied. Please check your browser settings.');
      } else if (event.error === 'no-speech') {
        setErrorMessage('No speech detected. Please speak louder or closer to the microphone.');
      } else {
        setErrorMessage(`Error: ${event.error}`);
      }
      setStatus('error');
    };

    rec.onend = () => {
      setStatus((prevStatus) => {
        if (prevStatus === 'listening') {
          return 'processing';
        }
        return prevStatus;
      });
    };

    recognitionRef.current = rec;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
      if (autoCloseTimeoutRef.current) {
        clearTimeout(autoCloseTimeoutRef.current);
      }
    };
  }, []);

  // Handle state transition from listening to processing
  useEffect(() => {
    if (status === 'processing') {
      processTranscript();
    }
  }, [status]);

  // Start/Stop listening helper functions
  const startListening = () => {
    if (autoCloseTimeoutRef.current) {
      clearTimeout(autoCloseTimeoutRef.current);
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error('Could not start recognition:', e);
        try {
          recognitionRef.current.stop();
          recognitionRef.current.start();
        } catch (err) {}
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
  };

  // Start listening automatically when modal opens
  useEffect(() => {
    if (isOpen) {
      if (status !== 'unsupported') {
        const t = setTimeout(() => {
          startListening();
        }, 300);
        return () => clearTimeout(t);
      }
    } else {
      stopListening();
    }
  }, [isOpen]);

const getHindiSkeleton = (word: string): string => {
  if (!word) return '';
  let w = word.toLowerCase();
  
  w = w.replace(/ph/g, 'f');
  w = w.replace(/v/g, 'b');
  w = w.replace(/z/g, 'j');
  w = w.replace(/sh/g, 's');
  w = w.replace(/kh/g, 'k');
  w = w.replace(/gh/g, 'g');
  w = w.replace(/dh/g, 'd');
  w = w.replace(/th/g, 't');
  w = w.replace(/bh/g, 'b');
  w = w.replace(/jh/g, 'j');
  w = w.replace(/ch/g, 'c');
  
  w = w.replace(/\s+/g, '');
  w = w.replace(/(.)\1+/g, '$1');

  if (w.length === 0) return '';
  
  const first = w[0];
  const rest = w.slice(1).replace(/[aeiouy]/g, '');
  return first + rest;
};

const getPhoneticScore = (s1: string, s2: string): number => {
  const sk1 = getHindiSkeleton(s1);
  const sk2 = getHindiSkeleton(s2);
  if (sk1 === sk2 && sk1.length > 0) return 0.85;
  if (sk1.length === 0 || sk2.length === 0) return 0;
  
  const maxLen = Math.max(sk1.length, sk2.length);
  const dist = getLevenshteinDistance(sk1, sk2);
  const sim = (maxLen - dist) / maxLen;
  return sim >= 0.75 ? 0.85 : sim;
};

  const matchCategoryFuzzy = (normalizedText: string, categories: any[]) => {
    const transcriptWords = normalizeAndStem(normalizedText);
    
    let bestMatch: any = null;
    let highestScore = 0;
    let matchedPhraseLength = 0;

    for (const cat of categories) {
      const altPhrases = getAltPhrases(cat.name);
      
      for (const phrase of altPhrases) {
        const phraseWords = normalizeAndStem(phrase);
        const W = phraseWords.length;
        if (W === 0) continue;

        let bestPhraseScore = 0;

        // 1. Try exact contiguous subsegment match first (stemmed words match exactly)
        let isExactContiguous = false;
        if (transcriptWords.length >= W) {
          for (let i = 0; i <= transcriptWords.length - W; i++) {
            let match = true;
            for (let j = 0; j < W; j++) {
              if (transcriptWords[i + j] !== phraseWords[j]) {
                match = false;
                break;
              }
            }
            if (match) {
              isExactContiguous = true;
              break;
            }
          }
        }

        if (isExactContiguous) {
          bestPhraseScore = 1.0;
        } else {
          // 2. Fuzzy match fallback using sliding window
          const phraseStr = phraseWords.join(' ');
          if (transcriptWords.length < W) {
            const windowStr = transcriptWords.join(' ');
            const score = getStringSimilarity(windowStr, phraseStr);
            const phoneticScore = getPhoneticScore(windowStr, phraseStr);
            bestPhraseScore = Math.max(score, phoneticScore);
          } else {
            for (let i = 0; i <= transcriptWords.length - W; i++) {
              const windowStr = transcriptWords.slice(i, i + W).join(' ');
              const score = getStringSimilarity(windowStr, phraseStr);
              const phoneticScore = getPhoneticScore(windowStr, phraseStr);
              const combinedScore = Math.max(score, phoneticScore);
              if (combinedScore > bestPhraseScore) {
                bestPhraseScore = combinedScore;
              }
            }
          }
        }

        // Add a slight preference bonus if we matched the category's full name
        // rather than just a split sub-phrase (e.g. "Rent" vs sub-phrase of "Home Rent")
        let scoreBonus = 0;
        if (phrase === cat.name.toLowerCase()) {
          scoreBonus = 0.01;
        }

        const finalScore = bestPhraseScore + scoreBonus;

        // Determine threshold based on phrase character length
        const phraseCharLength = phraseWords.join(' ').length;
        const threshold = phraseCharLength <= 3 ? 0.65 : 0.75;

        if (bestPhraseScore >= threshold) {
          if (
            finalScore > highestScore || 
            (finalScore === highestScore && phraseWords.length > matchedPhraseLength)
          ) {
            highestScore = finalScore;
            bestMatch = cat;
            matchedPhraseLength = phraseWords.length;
          }
        }
      }
    }

    return bestMatch ? { category: bestMatch, score: highestScore > 1.0 ? 1.0 : highestScore } : null;
  };

  const parseVoiceCommand = (text: string) => {
    // Strip commas from numbers (e.g., "11,000" -> "11000") to avoid parsing truncation
    const normalized = text.toLowerCase().replace(/(\d),(?=\d)/g, '$1');
    const isRemoval = /\b(remove|subtract|reduce|delete|minus|deduct)\b/.test(normalized);

    // 1. Extract amount and math expression first
    let mathText = normalized
      .replace(/\belevan\b/g, 'eleven')
      .replace(/\bhundrad\b/g, 'hundred')
      .replace(/\bhundered\b/g, 'hundred')
      .replace(/\bthosand\b/g, 'thousand')
      .replace(/\blacks\b/g, 'lakhs')
      .replace(/\black\b/g, 'lakh')
      .replace(/\blacs\b/g, 'lakhs')
      .replace(/\blac\b/g, 'lakh')
      .replace(/\btwalve\b/g, 'twelve')
      .replace(/\bforteen\b/g, 'fourteen')
      .replace(/\bplus\b/g, '+')
      .replace(/\bminus\b/g, '-')
      .replace(/\btimes\b/g, '*')
      .replace(/\bmultiplied\s+by\b/g, '*')
      .replace(/\bdivided\s+by\b/g, '/')
      .replace(/(\d+)\s+and\s+(\d+)/g, '$1 + $2');

    // ─── Indian number word converter ───────────────────────────────────────
    // Handles spoken forms: "one lakh", "one lakh twenty thousand",
    //   "1 lakh twenty thousand", "two crore fifty lakh", etc.
    // Step 0 runs FIRST to convert number-words → digits so that the
    // lakh/crore/thousand regexes (which expect \d+) can match them.

    // Step 0 — number words → digits
    // We use a function that converts a contiguous run of English number-words
    // that appear immediately before (or after) an Indian unit word into a digit.
    const ones: Record<string, number> = {
      zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5,
      six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
      eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15,
      sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19,
    };
    const tens: Record<string, number> = {
      twenty: 20, thirty: 30, forty: 40, fifty: 50,
      sixty: 60, seventy: 70, eighty: 80, ninety: 90,
    };

    // Converts a phrase like "twenty five" or "one hundred twenty" to a number.
    // Returns null if no number words are found.
    function wordsToNum(phrase: string): number | null {
      const words = phrase.trim().split(/\s+/);
      let total = 0;
      let current = 0;
      let found = false;
      for (const w of words) {
        if (ones[w] !== undefined) {
          current += ones[w];
          found = true;
        } else if (tens[w] !== undefined) {
          current += tens[w];
          found = true;
        } else if (w === 'hundred') {
          if (current === 0) current = 1;
          current *= 100;
          found = true;
        } else {
          // non-number word — stop
          break;
        }
      }
      total += current;
      return found ? total : null;
    }

    // Replace word-number groups that precede an Indian unit word (crore/lakh/thousand/k)
    // e.g. "one lakh" → "1 lakh", "twenty five thousand" → "25 thousand"
    // Pattern: one or more number-word tokens immediately before the unit keyword
    const unitKeywords = ['crore', 'lakh', 'lakhs', 'thousand', 'k'];
    const numberWordPattern = new RegExp(
      `\\b((?:(?:zero|one|two|three|four|five|six|seven|eight|nine|ten|` +
      `eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|` +
      `twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred)\\s+)+)` +
      `(${unitKeywords.join('|')})\\b`,
      'g'
    );
    mathText = mathText.replace(numberWordPattern, (_match, numPart: string, unit: string) => {
      const n = wordsToNum(numPart.trim());
      return n !== null ? `${n} ${unit}` : _match;
    });

    // Also handle standalone number words that appear as amounts (no unit after them)
    // e.g. "add one hundred to food" — convert "one hundred" → "100"
    const standalonePattern = new RegExp(
      `\\b((?:(?:zero|one|two|three|four|five|six|seven|eight|nine|ten|` +
      `eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|` +
      `twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred)\\s*)+)\\b`,
      'g'
    );
    mathText = mathText.replace(standalonePattern, (match) => {
      // Only replace if this isn't already a digit sequence
      if (/^\d/.test(match.trim())) return match;
      const n = wordsToNum(match.trim());
      return n !== null ? String(n) : match;
    });

    // Step A — verbal fractions → decimals
    mathText = mathText
      .replace(/\bhalf\s+crore\b/g, '5000000')
      .replace(/\bquarter\s+crore\b/g, '2500000')
      .replace(/\bhalf\s+lakh\b/g, '50000')
      .replace(/\bquarter\s+lakh\b/g, '25000')
      .replace(/\bhalf\s+thousand\b/g, '500')
      .replace(/\bquarter\s+thousand\b/g, '250');

    // Step B — "N crore M lakh P thousand" compound form → single number
    // Now supports both digits (after Step 0 conversion) and original digit inputs
    mathText = mathText.replace(
      /(\d+(?:\.\d+)?)\s*crore\s+(\d+(?:\.\d+)?)\s*lakh\s+(\d+(?:\.\d+)?)\s*thousand/g,
      (_, c, l, t) => String(parseFloat(c) * 1e7 + parseFloat(l) * 1e5 + parseFloat(t) * 1e3)
    );
    mathText = mathText.replace(
      /(\d+(?:\.\d+)?)\s*crore\s+(\d+(?:\.\d+)?)\s*lakh/g,
      (_, c, l) => String(parseFloat(c) * 1e7 + parseFloat(l) * 1e5)
    );
    mathText = mathText.replace(
      /(\d+(?:\.\d+)?)\s*crore\s+(\d+(?:\.\d+)?)\s*thousand/g,
      (_, c, t) => String(parseFloat(c) * 1e7 + parseFloat(t) * 1e3)
    );
    mathText = mathText.replace(
      /(\d+(?:\.\d+)?)\s*lakh\s+(\d+(?:\.\d+)?)\s*thousand/g,
      (_, l, t) => String(parseFloat(l) * 1e5 + parseFloat(t) * 1e3)
    );
    // Also handle "N lakh M hundred" (e.g. "1 lakh 500" spoken as "1 lakh five hundred")
    mathText = mathText.replace(
      /(\d+(?:\.\d+)?)\s*lakh\s+(\d+(?:\.\d+)?)\b(?!\s*(?:thousand|crore|lakh|k\b))/g,
      (_, l, r) => {
        const remainder = parseFloat(r);
        // Only treat as lakh+remainder if remainder < 1000 (hundreds/plain digits)
        if (remainder < 100000) {
          return String(parseFloat(l) * 1e5 + remainder);
        }
        return _;
      }
    );

    // Step C — single unit words
    mathText = mathText.replace(
      /(\d+(?:\.\d+)?)\s*crore/g,
      (_, n) => String(parseFloat(n) * 1e7)
    );
    mathText = mathText.replace(
      /(\d+(?:\.\d+)?)\s*lakh(?:s)?/g,
      (_, n) => String(parseFloat(n) * 1e5)
    );
    mathText = mathText.replace(
      /(\d+(?:\.\d+)?)\s*(?:thousand|k\b)/g,
      (_, n) => String(parseFloat(n) * 1e3)
    );
    // ────────────────────────────────────────────────────────────────────────

    const mathRegex = /\b\d+(?:\.\d+)?(?:\s*[\+\-\*/]\s*\d+(?:\.\d+)?)*\b/g;
    const matches = [...mathText.matchAll(mathRegex)];

    if (matches.length === 0) {
      return null;
    }

    const calculationExpr = matches[0][0];
    let amount = 0;
    try {
      const cleanExpr = calculationExpr.replace(/[^0-9+\-*/().]/g, '');
      if (/^[0-9+\-*/().]+$/.test(cleanExpr)) {
        amount = new Function(`return ${cleanExpr}`)();
      }
    } catch (e) {
      console.error('Failed to parse math expression:', e);
      const digitsOnly = calculationExpr.replace(/[^0-9.]/g, '');
      amount = parseFloat(digitsOnly) || 0;
    }

    if (isNaN(amount) || amount <= 0) {
      return null;
    }

    const roundedAmount = Math.round(amount * 100) / 100;

    // 2. Determine type preference if spoken explicitly
    let typePreference: 'expense' | 'earning' | null = null;
    if (/\b(expense|spend|spent|paid|buy|bought|cost|out|shopping|bills?|water|electric|rent|fuel|emi)\b/.test(normalized)) {
      typePreference = 'expense';
    } else if (/\b(earning|income|salary|earned|receive|received|in|deposit|freelance|bonus|dividend)\b/.test(normalized)) {
      typePreference = 'earning';
    }

    // 3. Find category match in expenses using fuzzy matching
    const expMatch = matchCategoryFuzzy(normalized, expenseCategories);
    const matchedExpCat = expMatch ? expMatch.category : null;
    const expScore = expMatch ? expMatch.score : 0;

    // 4. Find category match in earnings using fuzzy matching
    const earnMatch = matchCategoryFuzzy(normalized, earningCategories);
    const matchedEarnCat = earnMatch ? earnMatch.category : null;
    const earnScore = earnMatch ? earnMatch.score : 0;

    // 5. Handle duplicate category name collision (same name in both lists)
    const isSameName = matchedExpCat && matchedEarnCat &&
      matchedExpCat.name.toLowerCase() === matchedEarnCat.name.toLowerCase();

    if (isSameName) {
      return {
        isAmbiguous: true,
        expenseCategory: matchedExpCat,
        earningCategory: matchedEarnCat,
        amount: roundedAmount,
        calculationExpr: calculationExpr !== String(roundedAmount) ? calculationExpr : undefined,
        isRemoval,
      };
    }

    // 6. Resolve based on type preference if explicitly spoken
    if (typePreference === 'expense' && matchedExpCat) {
      return {
        isAmbiguous: false,
        category: matchedExpCat,
        type: 'expense' as const,
        amount: roundedAmount,
        calculationExpr: calculationExpr !== String(roundedAmount) ? calculationExpr : undefined,
        isRemoval,
      };
    }
    if (typePreference === 'earning' && matchedEarnCat) {
      return {
        isAmbiguous: false,
        category: matchedEarnCat,
        type: 'earning' as const,
        amount: roundedAmount,
        calculationExpr: calculationExpr !== String(roundedAmount) ? calculationExpr : undefined,
        isRemoval,
      };
    }

    // 7. Resolve based on best matching score when both match different categories
    if (matchedExpCat && matchedEarnCat) {
      const scoreDiff = Math.abs(expScore - earnScore);
      if (scoreDiff > 0.15) {
        if (expScore > earnScore) {
          return {
            isAmbiguous: false,
            category: matchedExpCat,
            type: 'expense' as const,
            amount: roundedAmount,
            calculationExpr: calculationExpr !== String(roundedAmount) ? calculationExpr : undefined,
            isRemoval,
          };
        } else {
          return {
            isAmbiguous: false,
            category: matchedEarnCat,
            type: 'earning' as const,
            amount: roundedAmount,
            calculationExpr: calculationExpr !== String(roundedAmount) ? calculationExpr : undefined,
            isRemoval,
          };
        }
      } else {
        // Scores are too close — treat as ambiguous
        return {
          isAmbiguous: true,
          expenseCategory: matchedExpCat,
          earningCategory: matchedEarnCat,
          amount: roundedAmount,
          calculationExpr: calculationExpr !== String(roundedAmount) ? calculationExpr : undefined,
          isRemoval,
        };
      }
    }

    // 8. Single category matches
    if (matchedExpCat) {
      return {
        isAmbiguous: false,
        category: matchedExpCat,
        type: 'expense' as const,
        amount: roundedAmount,
        calculationExpr: calculationExpr !== String(roundedAmount) ? calculationExpr : undefined,
        isRemoval,
      };
    }
    if (matchedEarnCat) {
      return {
        isAmbiguous: false,
        category: matchedEarnCat,
        type: 'earning' as const,
        amount: roundedAmount,
        calculationExpr: calculationExpr !== String(roundedAmount) ? calculationExpr : undefined,
        isRemoval,
      };
    }

    return null;
  };

  const processTranscript = async () => {
    if (!transcript.trim()) {
      setErrorMessage('No speech detected. Please try again.');
      setStatus('error');
      return;
    }

    const parsed = parseVoiceCommand(transcript);
    if (!parsed) {
      setErrorMessage(
        'Could not match a category or amount. Try saying something like: "Food 150" or "Salary 50000".'
      );
      setStatus('error');
      return;
    }

    if (parsed.isAmbiguous) {
      setAmbiguityInfo({
        expenseCategory: parsed.expenseCategory!,
        earningCategory: parsed.earningCategory!,
        amount: parsed.amount,
        calculationExpr: parsed.calculationExpr,
        isRemoval: parsed.isRemoval,
      });
      setStatus('ambiguous');
    } else {
      try {
        const result = await saveToDatabase({
          category: parsed.category!,
          type: parsed.type!,
          amount: parsed.amount,
          calculationExpr: parsed.calculationExpr,
          isRemoval: parsed.isRemoval,
        });
        setSuccessInfo(result);
        setStatus('success');

        autoCloseTimeoutRef.current = setTimeout(() => {
          onClose();
        }, 3500);
      } catch (err: any) {
        console.error('Failed to save voice transaction:', err);
        setErrorMessage(err?.message || 'Failed to save to database. Please try again.');
        setStatus('error');
      }
    }
  };

  const resolveAmbiguity = async (type: 'expense' | 'earning') => {
    if (!ambiguityInfo) return;
    setStatus('processing');
    try {
      const category = type === 'expense' ? ambiguityInfo.expenseCategory : ambiguityInfo.earningCategory;
      const result = await saveToDatabase({
        category,
        type,
        amount: ambiguityInfo.amount,
        calculationExpr: ambiguityInfo.calculationExpr,
        isRemoval: ambiguityInfo.isRemoval,
      });
      setSuccessInfo(result);
      setStatus('success');
      setAmbiguityInfo(null);

      autoCloseTimeoutRef.current = setTimeout(() => {
        onClose();
      }, 3500);
    } catch (err: any) {
      console.error('Failed to save voice transaction after resolving ambiguity:', err);
      setErrorMessage(err?.message || 'Failed to save to database. Please try again.');
      setStatus('error');
    }
  };

  const saveToDatabase = async (parsed: {
    category: any;
    type: 'expense' | 'earning';
    amount: number;
    calculationExpr?: string;
    isRemoval?: boolean;
  }) => {
    const d = new Date();
    const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    if (parsed.type === 'expense') {
      // ✅ Always read FRESH data from SERVER to bypass stale caches
      const freshExpenses = await db.expenses.toArray(true);
      const existing = freshExpenses.find(
        (e) => e.categoryId === parsed.category.id && e.date === todayStr
      );

      if (existing) {
        const oldAmount = existing.amount;
        const newAmount = Math.round((oldAmount + (parsed.isRemoval ? -parsed.amount : parsed.amount)) * 100) / 100;
        const operator = parsed.isRemoval ? '-' : '+';
        const additionDetail = parsed.calculationExpr
          ? `${parsed.amount} (${parsed.calculationExpr})`
          : `${parsed.amount}`;
        const notes = existing.notes
          ? `${existing.notes} | ${operator}₹${additionDetail} via voice`
          : `Voice: ${operator}₹${additionDetail}`;

        if (newAmount <= 0) {
          await db.expenses.delete(existing.id!);
          return {
            categoryName: parsed.category.name,
            type: 'expense' as const,
            amount: parsed.amount,
            isUpdate: true,
            oldAmount,
            newAmount: 0,
            isDeleted: true,
          };
        } else {
          await db.expenses.update(existing.id!, {
            amount: newAmount,
            notes,
          });

          return {
            categoryName: parsed.category.name,
            type: 'expense' as const,
            amount: parsed.amount,
            isUpdate: true,
            oldAmount,
            newAmount,
          };
        }
      } else {
        if (parsed.isRemoval) {
          throw new Error(`No existing expense for "${parsed.category.name}" today to remove from.`);
        }
        const notes = parsed.calculationExpr
          ? `Voice: ${parsed.calculationExpr} = ₹${parsed.amount}`
          : 'Added via voice';

        await db.expenses.add({
          date: todayStr,
          categoryId: parsed.category.id!,
          amount: parsed.amount,
          paymentMethod: 'Cash',
          notes,
          tags: ['voice'],
          isRecurring: false,
          createdAt: new Date().toISOString(),
        });

        return {
          categoryName: parsed.category.name,
          type: 'expense' as const,
          amount: parsed.amount,
          isUpdate: false,
        };
      }
    } else {
      // ✅ Always read FRESH data from SERVER to bypass stale caches
      const freshEarnings = await db.earnings.toArray(true);
      const existing = freshEarnings.find(
        (e) => e.categoryId === parsed.category.id && e.date === todayStr
      );

      if (existing) {
        const oldAmount = existing.amount;
        const newAmount = Math.round((oldAmount + (parsed.isRemoval ? -parsed.amount : parsed.amount)) * 100) / 100;
        const operator = parsed.isRemoval ? '-' : '+';
        const additionDetail = parsed.calculationExpr
          ? `${parsed.amount} (${parsed.calculationExpr})`
          : `${parsed.amount}`;
        const notes = existing.notes
          ? `${existing.notes} | ${operator}₹${additionDetail} via voice`
          : `Voice: ${operator}₹${additionDetail}`;

        if (newAmount <= 0) {
          await db.earnings.delete(existing.id!);
          return {
            categoryName: parsed.category.name,
            type: 'earning' as const,
            amount: parsed.amount,
            isUpdate: true,
            oldAmount,
            newAmount: 0,
            isDeleted: true,
          };
        } else {
          await db.earnings.update(existing.id!, {
            amount: newAmount,
            notes,
          });

          return {
            categoryName: parsed.category.name,
            type: 'earning' as const,
            amount: parsed.amount,
            isUpdate: true,
            oldAmount,
            newAmount,
          };
        }
      } else {
        if (parsed.isRemoval) {
          throw new Error(`No existing earning for "${parsed.category.name}" today to remove from.`);
        }
        const notes = parsed.calculationExpr
          ? `Voice: ${parsed.calculationExpr} = ₹${parsed.amount}`
          : 'Added via voice';

        await db.earnings.add({
          date: todayStr,
          categoryId: parsed.category.id!,
          amount: parsed.amount,
          source: 'Voice',
          notes,
          isRecurring: false,
          createdAt: new Date().toISOString(),
        });

        return {
          categoryName: parsed.category.name,
          type: 'earning' as const,
          amount: parsed.amount,
          isUpdate: false,
        };
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Assistant Dialog Card */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface-secondary)] shadow-2xl p-6 md:p-8 flex flex-col items-center text-center"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 p-2 rounded-xl text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              <X size={20} />
            </button>

            {/* Title */}
            <h2 className="text-xl font-bold bg-gradient-to-r from-violet-500 to-fuchsia-600 bg-clip-text text-transparent mb-1">
              Voice Assistant
            </h2>
            <p className="text-xs text-[var(--color-text-tertiary)] mb-6">
              Add transactions naturally with your voice
            </p>

            {/* Mic / Status Animation States */}
            <div className="relative w-36 h-36 flex items-center justify-center mb-6">
              {status === 'listening' && (
                <>
                  <motion.div
                    animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'easeOut' }}
                    className="absolute inset-0 rounded-full bg-violet-500/20"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.8, 1], opacity: [0.4, 0, 0.4] }}
                    transition={{ repeat: Infinity, duration: 2, delay: 0.5, ease: 'easeOut' }}
                    className="absolute inset-0 rounded-full bg-fuchsia-500/10"
                  />
                </>
              )}

              <div
                className={`w-24 h-24 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
                  status === 'listening'
                    ? 'bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white cursor-pointer hover:scale-105'
                    : status === 'processing'
                    ? 'bg-violet-100 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400'
                    : status === 'success'
                    ? 'bg-emerald-500 text-white'
                    : status === 'error'
                    ? 'bg-rose-500 text-white'
                    : status === 'ambiguous'
                    ? 'bg-amber-500 text-white animate-bounce'
                    : 'bg-[var(--color-surface-tertiary)] text-[var(--color-text-secondary)]'
                }`}
                onClick={status === 'listening' ? stopListening : startListening}
              >
                {status === 'listening' && <Mic size={36} className="animate-pulse" />}
                {status === 'processing' && <Loader2 size={36} className="animate-spin" />}
                {status === 'success' && <CheckCircle2 size={40} />}
                {status === 'error' && <AlertCircle size={40} />}
                {status === 'unsupported' && <MicOff size={36} />}
                {status === 'ambiguous' && <HelpCircle size={40} />}
                {status === 'idle' && <Play size={36} className="ml-1 text-violet-500" />}
              </div>
            </div>

            {/* Transcript & Status Output */}
            <div className="w-full min-h-[90px] px-4 py-3 rounded-2xl bg-[var(--color-surface-tertiary)] border border-[var(--color-border)] flex flex-col justify-center items-center mb-6">
              {status === 'listening' && (
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-violet-500 tracking-wider animate-pulse">Listening...</p>
                  <p className="text-sm text-[var(--color-text-primary)] font-medium italic break-words line-clamp-2">
                    {transcript || 'Say something...'}
                  </p>
                </div>
              )}

              {status === 'processing' && (
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-violet-500 tracking-wider">Processing Command...</p>
                  <p className="text-sm text-[var(--color-text-secondary)] italic break-words line-clamp-2">
                    "{transcript}"
                  </p>
                </div>
              )}

              {status === 'ambiguous' && ambiguityInfo && (
                <div className="text-center space-y-1">
                  <p className="text-xs font-semibold text-amber-500 tracking-wider">Choose Transaction Type</p>
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">
                    "<span className="font-bold text-violet-500">{ambiguityInfo.expenseCategory.name}</span>" exists in both areas.
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                    Should <span className="font-bold text-[var(--color-text-primary)]">{formatCurrency(ambiguityInfo.amount)}</span> go to Expense or Earning?
                  </p>
                </div>
              )}

              {status === 'success' && successInfo && (
                <div className="text-center space-y-1">
                  <p className={`text-xs font-semibold ${successInfo.isDeleted ? 'text-rose-500' : 'text-emerald-500'} tracking-wider`}>
                    {successInfo.isDeleted ? 'Transaction Removed!' : 'Transaction Saved!'}
                  </p>
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">
                    {successInfo.isDeleted
                      ? 'Removed '
                      : successInfo.isUpdate
                      ? 'Updated '
                      : 'Added '}{' '}
                    <span className="font-bold text-[var(--color-text-primary)]">{successInfo.categoryName}</span>
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)] font-semibold mt-1">
                    {successInfo.isUpdate ? (
                      <span>
                        {formatCurrency(successInfo.oldAmount || 0)} →{' '}
                        <span className={`${successInfo.isDeleted ? 'text-rose-500' : 'text-emerald-500'} font-bold`}>
                          {formatCurrency(successInfo.newAmount || 0)}
                        </span>
                      </span>
                    ) : (
                      <span className="text-emerald-500 font-bold">{formatCurrency(successInfo.amount)}</span>
                    )}
                  </p>
                </div>
              )}

              {status === 'error' && (
                <div className="text-center space-y-1 text-rose-500 px-2">
                  <p className="text-xs font-semibold tracking-wider">Understand Error</p>
                  <p className="text-xs font-medium leading-relaxed">{errorMessage}</p>
                </div>
              )}

              {status === 'unsupported' && (
                <div className="text-center space-y-1 text-amber-500">
                  <p className="text-xs font-semibold tracking-wider">Unsupported Browser</p>
                  <p className="text-xs font-medium">Web Speech API is not supported in this browser. Please try Google Chrome or Safari.</p>
                </div>
              )}

              {status === 'idle' && (
                <p className="text-xs text-[var(--color-text-tertiary)]">
                  Click the center button to begin recording.
                </p>
              )}
            </div>

            {/* Instruction Tip */}
            {status === 'listening' && (
              <div className="text-left text-xs text-[var(--color-text-tertiary)] bg-[var(--color-surface)] rounded-xl p-3 border border-[var(--color-border)] w-full">
                <span className="font-semibold text-[var(--color-text-secondary)] block mb-1">Try saying:</span>
                <ul className="list-disc list-inside space-y-0.5 opacity-80">
                  <li>"Food 120 plus 50"</li>
                  <li>"Add 500 to Groceries"</li>
                  <li>"Salary 45000"</li>
                </ul>
              </div>
            )}

            {/* Controls / Decision Options */}
            <div className="w-full mt-2">
              {status === 'listening' && (
                <button
                  onClick={stopListening}
                  className="w-full py-2.5 rounded-xl bg-violet-600 text-white hover:bg-violet-700 text-sm font-semibold transition-all shadow-md"
                >
                  Done
                </button>
              )}

              {status === 'ambiguous' && ambiguityInfo && (
                <div className="grid grid-cols-2 gap-3 w-full">
                  <button
                    onClick={() => resolveAmbiguity('expense')}
                    className="py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 text-white text-sm font-semibold hover:from-rose-600 hover:to-rose-700 shadow-md transition-all"
                  >
                    Expense
                  </button>
                  <button
                    onClick={() => resolveAmbiguity('earning')}
                    className="py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-semibold hover:from-emerald-600 hover:to-emerald-700 shadow-md transition-all"
                  >
                    Earning
                  </button>
                </div>
              )}

              {(status === 'error' || status === 'idle') && (
                <button
                  onClick={startListening}
                  className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition-all shadow-md"
                >
                  Try Again
                </button>
              )}

              {status === 'success' && (
                <button
                  onClick={onClose}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-all shadow-md"
                >
                  Close
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
