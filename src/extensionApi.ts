import * as httpyac from 'httpyac';
import * as vscode from 'vscode';

export interface ResponseItem {
  readonly id: string;
  readonly created: Date;
  readonly name: string;
  readonly openWith?: string;
  readonly extension: string;
  readonly testResults?: Array<httpyac.TestResult>;
  readonly metaData: Record<string, unknown>;
  readonly response: httpyac.HttpResponse;
  responseUri?: vscode.Uri;
  documentUri?: vscode.Uri;
  isCachedResponse: boolean;
  loadResponseBody?(): Promise<void>;
}

export type ResponseHandler = (responseItem: ResponseItem) => Promise<boolean>;

export interface ResponseOutputProcessor {
  show: httpyac.RequestLogger;
}

export interface DocumentStore {
  readonly httpFileStore: httpyac.store.HttpFileStore;
  activeEnvironment: Array<string> | undefined;
  getActiveEnvironment(httpFile: httpyac.HttpFile): Array<string> | undefined;
  getDocumentPathLike: (document: vscode.TextDocument) => httpyac.PathLike;
  getHttpFile(document: vscode.TextDocument): Promise<httpyac.HttpFile | undefined>;
  getAll(): Array<httpyac.HttpFile>;
  getOrCreate(path: httpyac.PathLike, getText: () => Promise<string>, version: number): Promise<httpyac.HttpFile>;
  parse(uri: vscode.Uri | undefined, text: string): Promise<httpyac.HttpFile>;
  remove(document: vscode.TextDocument): void;
  send: (context: httpyac.HttpFileSendContext | httpyac.HttpRegionsSendContext) => Promise<boolean>;
  clear(): void;
}

export interface ResponseStore {
  readonly hasItems: boolean;
  readonly historyChanged: vscode.Event<void>;
  add(response: httpyac.HttpResponse, httpRegion?: httpyac.HttpRegion, show?: boolean): Promise<void>;
  remove(responseItem: ResponseItem): Promise<boolean>;
  clear(): Promise<void>;
}

export interface HttpYacExtensionApi {
  httpyac: typeof httpyac;
  documentStore: DocumentStore;
  responseStore: ResponseStore;
  httpDocumentSelector: vscode.DocumentSelector;
  allHttpDocumentSelector: vscode.DocumentSelector;
  environmentChanged: vscode.Event<string[] | undefined>;
  getEnvironmentConfig(path: httpyac.PathLike): Promise<httpyac.EnvironmentConfig>;
  getErrorQuickFix: (err: Error) => string | undefined;
}
