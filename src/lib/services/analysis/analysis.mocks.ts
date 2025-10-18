import type { TextAnalysisDto } from "../../../types";

export const correctTextMock: TextAnalysisDto = {
  is_correct: true,
  original_text: "I am a student.",
};

export const incorrectTextMock: TextAnalysisDto = {
  is_correct: false,
  original_text: "I is a student. He go to school.",
  corrected_text: "I am a student. He goes to school.",
  explanation: "Use 'am' with 'I'. Use 'goes' for third-person singular.",
};

export const verbTenseErrorMock: TextAnalysisDto = {
  is_correct: false,
  original_text: "She don't like apples.",
  corrected_text: "She doesn't like apples.",
  explanation: "Use 'doesn't' for third-person singular in negative present simple.",
};

export const articleErrorMock: TextAnalysisDto = {
  is_correct: false,
  original_text: "I saw a apple on table.",
  corrected_text: "I saw an apple on the table.",
  explanation: "Use 'an' before vowel sounds. Add 'the' before specific nouns.",
};

export function getMockAnalysis(text: string): TextAnalysisDto {
  const lowerText = text.toLowerCase().trim();

  if (lowerText.includes("i is") || lowerText.includes("he go")) {
    return {
      ...incorrectTextMock,
      original_text: text,
    };
  }

  if (lowerText.includes("don't") && (lowerText.includes("she") || lowerText.includes("he"))) {
    return {
      ...verbTenseErrorMock,
      original_text: text,
    };
  }

  if (lowerText.includes("a apple") || lowerText.includes("on table")) {
    return {
      ...articleErrorMock,
      original_text: text,
    };
  }

  return {
    is_correct: true,
    original_text: text,
  };
}
