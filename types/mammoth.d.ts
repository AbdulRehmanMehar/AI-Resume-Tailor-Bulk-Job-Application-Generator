declare module "mammoth/mammoth.browser" {
  interface ExtractResult {
    value: string;
    messages: any[];
  }

  interface Mammoth {
    extractRawText(options: {
      arrayBuffer: ArrayBuffer;
    }): Promise<ExtractResult>;
    convertToHtml(options: {
      arrayBuffer: ArrayBuffer;
    }): Promise<ExtractResult>;
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
