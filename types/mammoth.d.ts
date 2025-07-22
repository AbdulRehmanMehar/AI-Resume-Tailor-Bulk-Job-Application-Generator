declare module "mammoth/mammoth.browser" {
  interface ExtractResult {
    value: string;
    messages: any[];
  }

  interface ConvertOptions {
    arrayBuffer: ArrayBuffer;
    includeEmbeddedStyleMap?: boolean;
    includeDefaultStyleMap?: boolean;
    transformDocument?: (document: any) => any;
    styleMap?: string[];
    ignoreEmptyParagraphs?: boolean;
    convertImage?: (image: any) => any;
    idPrefix?: string;
  }

  interface ExtractOptions {
    arrayBuffer: ArrayBuffer;
    includeEmbeddedStyleMap?: boolean;
    includeDefaultStyleMap?: boolean;
  }

  interface Mammoth {
    extractRawText(options: ExtractOptions): Promise<ExtractResult>;
    convertToHtml(options: ConvertOptions): Promise<ExtractResult>;
    convertToMarkdown(options: ConvertOptions): Promise<ExtractResult>;
    images?: {
      imgElement: (alt: string) => any;
      dataUri: (alt: string) => any;
    };
  }

  const mammoth: Mammoth;
  export default mammoth;
}

declare module "docx-parser" {
  function parseDocx(data: ArrayBuffer): Promise<string>;
  export default parseDocx;
}

declare module "pizzip" {
  class PizZip {
    constructor(data: ArrayBuffer | string | null, options?: any);
    file(name: string): PizZipFile | null;
  }

  class PizZipFile {
    asText(): string;
  }

  export default PizZip;
}
