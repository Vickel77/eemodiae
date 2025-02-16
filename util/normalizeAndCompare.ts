export default function normalizeAndCompare(str1:string, str2:string) {
    let cleanStr1 = str1.replace(/[\W_]+/g, "").toLowerCase();
    let cleanStr2 = str2.replace(/[\W_]+/g, "").toLowerCase();
    return cleanStr1.trim().toLowerCase() === cleanStr2.trim().toLowerCase();
}