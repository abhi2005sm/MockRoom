export class SentenceSplitter {
  private buffer = '';

  push(chunk: string, onSentence: (sentence: string) => void) {
    this.buffer += chunk;

    // Regex matching sentence delimiters followed by whitespace or end of string
    const sentenceRegex = /([^.!?\n]+[.!?\n]+)/g;
    let match: RegExpExecArray | null;
    let lastIndex = 0;

    while ((match = sentenceRegex.exec(this.buffer)) !== null) {
      const sentence = match[1].trim();
      if (sentence) {
        onSentence(sentence);
      }
      lastIndex = sentenceRegex.lastIndex;
    }

    if (lastIndex > 0) {
      this.buffer = this.buffer.slice(lastIndex);
    }
  }

  flush(onSentence: (sentence: string) => void) {
    const remaining = this.buffer.trim();
    if (remaining) {
      onSentence(remaining);
      this.buffer = '';
    }
  }
}
