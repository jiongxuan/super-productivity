import { AndroidInterface } from './android-interface';
import { BehaviorSubject, merge, Subject } from 'rxjs';
import { mapTo } from 'rxjs/operators';
import { Plugins, Capacitor } from '@capacitor/core';
import { nanoid } from 'nanoid';

const { SUPPlugin } = Plugins;

const IS_ANDROID_CAPACITOR_WEB_VIEW =
  typeof Capacitor !== 'undefined' &&
  Capacitor.isNativePlatform &&
  Capacitor.Plugins &&
  Capacitor.Plugins.SUPPlugin;

if (!IS_ANDROID_CAPACITOR_WEB_VIEW) {
  throw new Error('Capacitor SUPPlugin is not available');
}

const androidInterface: AndroidInterface = {
  showToast: (s: string) => {
    SUPPlugin.showToast({ toast: s });
  },

  showNotification: (title: string, body: string) => {
    SUPPlugin.showNotification({ title, body });
  },

  showNotificationIfAppIsNotOpen: (title: string, body: string) => {
    SUPPlugin.showNotificationIfAppIsNotOpen({ title, body });
  },

  updateTaskData: (s: string) => {
    SUPPlugin.updateTaskData({ str: s });
  },

  // save
  saveToDbWrapped: (key: string, value: string): Promise<void> => {
    const requestId = nanoid();
    return new Promise((resolve, reject) => {
      SUPPlugin.saveToDbNew({ requestId, key, value })
        .then(() => resolve())
        .catch(reject);
    });
  },

  // load
  loadFromDbWrapped: (key: string): Promise<string | null> => {
    const requestId = nanoid();
    return new Promise((resolve, reject) => {
      SUPPlugin.loadFromDbNew({ requestId, key })
        .then((result) => {
          resolve(result.value || null);
        })
        .catch(reject);
    });
  },

  // remove
  removeFromDbWrapped: (key: string): Promise<void> => {
    const requestId = nanoid();
    return new Promise((resolve, reject) => {
      SUPPlugin.removeFromDb({ requestId, key })
        .then(() => resolve())
        .catch(reject);
    });
  },

  // clear db
  clearDbWrapped: (): Promise<void> => {
    const requestId = nanoid();
    return new Promise((resolve, reject) => {
      SUPPlugin.clearDb({ requestId })
        .then(() => resolve())
        .catch(reject);
    });
  },

  // permanent notification
  updatePermanentNotification: (
    title: string,
    message: string,
    progress: number,
  ): void => {
    // Not implemented in the plugin
    console.warn('updatePermanentNotification is deprecated or not implemented.');
  },

  // WebDAV
  makeHttpRequestWrapped: (
    url: string,
    method: string,
    data: string,
    username: string,
    password: string,
    readResponse: boolean,
  ): Promise<object> => {
    const requestId = nanoid();
    return new Promise((resolve, reject) => {
      SUPPlugin.makeHttpRequest({
        requestId,
        urlString: url,
        method,
        data,
        username,
        password,
        readResponse: readResponse.toString(),
      })
        .then((response) => {
          const result = JSON.parse(response.result);
          resolve(result);
        })
        .catch(reject);
    });
  },

  isGrantedFilePermission: (): boolean => {
    console.warn('isGrantedFilePermission should return a Promise<boolean> in Capacitor.');
    return false;
  },

  isGrantFilePermissionInProgress: false,

  allowedFolderPath: (): string => {
    console.warn('allowedFolderPath should return a Promise<string> in Capacitor.');
    return '';
  },

  grantFilePermissionWrapped: (): Promise<object> => {
    const requestId = nanoid();
    androidInterface.isGrantFilePermissionInProgress = true;
    return new Promise((resolve, reject) => {
      SUPPlugin.grantFilePermission({ requestId })
        .then(() => {
          androidInterface.isGrantFilePermissionInProgress = false;
          resolve();
        })
        .catch((error) => {
          androidInterface.isGrantFilePermissionInProgress = false;
          reject(error);
        });
    });
  },

  getFileRev: (filePath: string): Promise<string> => {
    return SUPPlugin.getFileRev({ filePath }).then((result) => result.lastModified);
  },

  readFile: (filePath: string): Promise<string> => {
    return SUPPlugin.readFile({ filePath }).then((result) => result.data);
  },

  writeFile: (filePath: string, data: string): Promise<void> => {
    return SUPPlugin.writeFile({ filePath, data }).then(() => {});
  },

  // added here only
  onResume$: new Subject<void>(),
  onPause$: new Subject<void>(),
  isInBackground$: null as any, // Will be set below
  onPauseCurrentTask$: new Subject<void>(),
  onMarkCurrentTaskAsDone$: new Subject<void>(),
  onAddNewTask$: new Subject<void>(),
  isKeyboardShown$: new BehaviorSubject<boolean>(false),
};

androidInterface.isInBackground$ = merge(
  androidInterface.onResume$.pipe(mapTo(false)),
  androidInterface.onPause$.pipe(mapTo(true)),
);

console.log('Android Capacitor interfaces initialized', androidInterface);

export { androidInterface };
