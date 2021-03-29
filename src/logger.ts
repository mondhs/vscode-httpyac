import { OutputChannel, window } from 'vscode';
import { APP_NAME, getConfigSetting } from './config';
import { outputProvider, LogLevel, PopupChannel, RequestChannel } from 'httpyac';


const outputChannels: Record<string, OutputChannel> = {};

function getOutputChannel(channel: string) {
  let outputChannel = outputChannels[channel];
  if (!outputChannel) {
    outputChannel = window.createOutputChannel(`${APP_NAME} - ${channel}`);
    outputChannels[channel] = outputChannel;
    outputChannel.show(true);
  }
  return outputChannel;
}

function logToOutputChannel(channel: string, level: LogLevel, ...params: any[]) {
  if (channel === PopupChannel) {
    showMessage(level, ...params);
    return;
  }

  const outputChannel = getOutputChannel(channel);
  if (params) {
    if (channel !== RequestChannel) {
      outputChannel.append(`${LogLevel[level].toUpperCase()}: `);
    }
    for (const param of params) {
      if (typeof param === 'string') {
        outputChannel.appendLine(param);
      } else if (param instanceof Error) {
        outputChannel.appendLine(`${param.name} - ${param.message}`);
        if (param.stack) {
          outputChannel.appendLine(param.stack);
        }
      } else {
        outputChannel.appendLine(`${JSON.stringify(param, null, 2)}`);
      }
    }
    if (level === LogLevel.error || channel !== RequestChannel) {
      outputChannel.show(true);
    }
  }
}


function showMessage(level: LogLevel, ...params: any[]) {
  if (getConfigSetting().showNotificationPopup) {
    const [message, ...args] = params;
    if (message) {
      switch (level) {
        case LogLevel.error:
          window.showErrorMessage(message, ...args);
          break;
        case LogLevel.warn:
          window.showWarningMessage(message, ...args);
          break;
        default:
          window.showInformationMessage(message, ...args);
          break;
      }
    }
  }
}





export function initVscodeLogger() {
  outputProvider.log = logToOutputChannel;
  return {
    dispose: function dispose() {
      for (const [key, value] of Object.entries(outputChannels)) {
        value.dispose();
        delete outputChannels[key];
      }
    }
  };
}