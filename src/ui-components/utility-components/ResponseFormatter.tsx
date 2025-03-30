import { FC, JSX, useEffect, useState } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import "./markdown.css";
import Prism from "prismjs";
import "prismjs/themes/prism.css";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";

interface ResponseFormatterProps {
  response: string;
}

interface MarkedOptions {
  gfm: boolean;
  breaks: boolean;
  highlight: (code: string, lang: string) => string;
}

const ResponseFormatter: FC<ResponseFormatterProps> = ({
  response,
}): JSX.Element => {
  const [formattedHtml, setFormattedHtml] = useState<{ __html: string }>({
    __html: "",
  });

  useEffect(() => {
    const options: MarkedOptions = {
      gfm: true,
      breaks: true,
      highlight: (code: string, lang: string): string => {
        if (lang && Prism.languages[lang]) {
          try {
            return Prism.highlight(code, Prism.languages[lang], lang);
          } catch (error) {
            console.error("Syntax highlighting failed:", error);
            return code;
          }
        }
        return code;
      },
    };

    marked.setOptions(options);

    const processMarkdown = async () => {
      try {
        const rawHtml = await marked(response);
        const sanitizedHtml = DOMPurify.sanitize(rawHtml);
        setFormattedHtml({ __html: sanitizedHtml });
      } catch (error) {
        console.error("Markdown processing failed:", error);
        setFormattedHtml({ __html: "Error processing markdown content" });
      }
    };

    processMarkdown();
    Prism.highlightAll();
  }, [response]);

  return (
    <div className="markdown-content" dangerouslySetInnerHTML={formattedHtml} />
  );
};

export default ResponseFormatter;
