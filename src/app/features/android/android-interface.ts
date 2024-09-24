import { IS_ANDROID_WEB_VIEW } from '../../util/is-android-web-view';
// import { IS_ANDROID_CAPACITOR } from '../../util/is-android-capacitor';
import { Observable, Subject } from 'rxjs';

export interface AndroidInterface {
  showToast(s: string): void;

  showNotification(title: string, body: string): void;

  showNotificationIfAppIsNotOpen?(title: string, body: string): void;

  updateTaskData(s: string): void;

  // save
  saveToDbWrapped(key: string, value: string): Promise<void>;

  saveToDb?(key: string, value: string): void; // @deprecated

  saveToDbNew?(rId: string, key: string, value: string): void;

  saveToDbCallback?(rId: string): void;

  // load
  loadFromDbWrapped(key: string): Promise<string | null>;

  loadFromDb?(key: string): void; // @deprecated

  loadFromDbNew?(rId: string, key: string): void;

  loadFromDbCallback?(rId: string, data: string): void;

  // remove
  removeFromDbWrapped(key: string): Promise<void>;

  removeFromDb?(rId: string, key: string): void; // @deprecated

  removeFromDbCallback?(rId: string): void;

  // clear db
  clearDbWrapped(): Promise<void>;

  clearDb?(rId: string): void; // @deprecated

  clearDbCallback?(rId: string): void;

  // permanent notification
  updatePermanentNotification?(
    title: string,
    // because java sucks, we have to do this
    message: string, // '' => undefined
    progress: number, // -1 => undefined; 999 => indeterminate; 333 => show play but no progress bar
  ): void;

  // WebDAV
  makeHttpRequestWrapped(
    url: string,
    method: string,
    data: string,
    username: string,
    password: string,
    readResponse: boolean,
  ): Promise<object>;

  makeHttpRequest?(
    rId: string,
    url: string,
    method: string,
    data: string,
    username: string,
    password: string,
    readResponse: boolean,
  ): void;

  makeHttpRequestCallback(rId: string, result: { [key: string]: any }): void;

  isGrantedFilePermission(): boolean;

  isGrantFilePermissionInProgress: boolean;
  allowedFolderPath(): string;
  grantFilePermissionWrapped(): Promise<object>;
  grantFilePermission(rId: string): void;
  grantFilePermissionCallBack(rId: string): void;

  getFileRev(filePath: string): string;
  readFile(filePath: string): string;
  writeFile(filePath: string, data: string): string;

  // added here only
  onResume$: Subject<void>;
  onPause$: Subject<void>;
  isInBackground$: Observable<boolean>;
  onPauseCurrentTask$: Subject<void>;
  onMarkCurrentTaskAsDone$: Subject<void>;
  onAddNewTask$: Subject<void>;
  isKeyboardShown$: Subject<boolean>;
}

// setInterval(() => {
//   androidInterface.updatePermanentNotification?.(new Date().toString(), '', -1);
// }, 7000);

let androidInterface: AndroidInterface = (window as any).SUPAndroid;
export const IS_ANDROID_BACKUP_READY =
  IS_ANDROID_WEB_VIEW &&
  (typeof androidInterface?.saveToDb === 'function' ||
    typeof androidInterface?.saveToDbNew === 'function');

const initializeAndroidInterface = async (): Promise<void> => {
  if (IS_ANDROID_WEB_VIEW) {
    const module = await import('./android-interface-webview');
    androidInterface = module.androidInterface;
  } /* else if (IS_ANDROID_CAPACITOR) {
    const module = await import('./android-interface-capacitor');
    androidInterface = module.androidInterface;
  } */

  if (!androidInterface) {
    throw new Error('Cannot initialize androidInterface');
  }
};

initializeAndroidInterface().catch((error) => {
  console.error(error);
});

export { androidInterface };
