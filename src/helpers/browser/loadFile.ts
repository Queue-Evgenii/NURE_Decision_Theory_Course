export const loadFile = <T>(file: File) => {
  return new Promise<T>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const result = e.target?.result as string;
        resolve(JSON.parse(result));
      } catch (error) {
        reject(error);
      }
    };

    reader.readAsText(file);
  })
};
