const getCircularSlice = <T>(arr: T[], startIdx: number, count: number): T[] => {
    const result: T[] = [];
    for (let i = 1; i <= count; i++) {
      const index = (startIdx + i) % arr.length;
      result.push(arr[index]);
    }
    return result;
  };

  export default getCircularSlice