/**
 * event
 */

import { BehaviorSubject, ReplaySubject, Subject } from 'rxjs';

export interface RxjsEvent<T> {
  replay?: number;
  initialValue: T;
}

export function CreateEventBus<T>(): {
  $on: (callback: (value?: T) => void) => void;
  $emit: (value?: T) => void;
} {
  const subject = new Subject();
  return {
    $on(callback) {
      subject.subscribe({
        next: (value: T) => {
          callback(value);
        }
      });
    },
    $emit(value?) {
      subject.next(value);
    }
  };
}

export function CreateBehaviorEventBus<T>(
  initialValue: T
): {
  value: () => T;
  $on: (callback: (value?: T) => void) => void;
  $emit: (value?: T) => void;
} {
  const subject = new BehaviorSubject(initialValue);
  return {
    value() {
      return subject.value;
    },
    $on(callback) {
      subject.subscribe({
        next: (value) => {
          callback(value);
        }
      });
    },
    $emit(value?) {
      subject.next(value);
    }
  };
}

export function CreateReplayEventBus<T>(
  replay: number
): {
  $on: (callback: (value?: T) => void) => void;
  $emit: (value?: T) => void;
} {
  const subject = new ReplaySubject(replay);
  return {
    $on(callback) {
      subject.subscribe({
        next: (value: T) => {
          callback(value);
        }
      });
    },
    $emit(value?) {
      subject.next(value);
    }
  };
}
