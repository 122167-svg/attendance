
export type AttendanceStatus = 'attended' | 'left' | 'absent';

export type StatusMap = Record<string, AttendanceStatus>;

export interface AppMessage {
  text: string;
  type: 'success' | 'error';
}

// This allows TypeScript to recognize the google.script.run API
// provided by the Google Apps Script environment.
declare global {
  // We are defining this in the global scope
  // eslint-disable-next-line no-unused-vars
  namespace google.script {
    interface Runner {
      withSuccessHandler(callback: (result: any) => void): Runner;
      withFailureHandler(callback: (error: Error) => void): Runner;
      [functionName: string]: (...args: any[]) => void;
    }
  }

  // eslint-disable-next-line no-unused-vars
  const google: {
    script: {
      run: google.script.Runner;
    }
  };
}

// This export statement is needed to treat this file as a module.
export {};
