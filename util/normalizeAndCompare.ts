export default function normalizeAndCompare(str1:string, str2:string) {
    let cleanStr1 = str1.replace(/[\W_]+/g, "").toLowerCase();
    let cleanStr2 = str2.replace(/[\W_]+/g, "").toLowerCase();
    return cleanString(cleanStr1) === cleanString(cleanStr2);
}

export function cleanString(str: string | any): string {
    return str
      .replace(/[^\w\s]/gi, '') // Remove special characters
      .trim() // Trim leading/trailing whitespace
      .replace(/\s+/g, '_'); // Replace spaces with underscores
  }
  