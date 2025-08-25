import { useCallback, useState } from "react";

export default function useCopy() {
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 1000);
    });
  }, []);
  return { isCopied, handleCopy };
}
