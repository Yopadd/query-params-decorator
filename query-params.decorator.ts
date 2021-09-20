function identity<T>(value: T) {
  return value;
}

function searchParamsToQueryString(searchParams: URLSearchParams) {
  searchParams.forEach((value, key) => {
    if (!value) {
      searchParams.delete(key);
    }
  });
  return searchParams.toString() ? `?${searchParams.toString()}` : '';
}

function replaceHistoryState(searchParams: URLSearchParams) {
  const queryString = searchParamsToQueryString(searchParams);
  history.replaceState(null, '', location.pathname + queryString);
}

function defineProperty<T>(
  target: any,
  key: string,
  set: (value: T) => void,
  get: () => T,
) {
  Reflect.defineProperty(target, key, {
    set,
    get,
    enumerable: true,
    configurable: true,
  });
}

export function QueryParams<T = string>(
  mapToValue: (params: string, value: T, target: any) => T | string = identity,
  mapToString: (value: T, target: any) => string = (value) => String(value),
) {
  return (target: any, key: string) => {
    let val: T;
    let isFirstCall = true;

    function setter(value: T): void {
      const searchParams = new URLSearchParams(location.search);
      if (isFirstCall && searchParams.has(key)) {
        val = mapToValue(searchParams.get(key) as string, value, target) as T;
      } else {
        val = value;
        searchParams.set(key, mapToString(value, target));
        replaceHistoryState(searchParams);
      }
      isFirstCall = false;
    }

    function getter(): T {
      return val;
    }

    defineProperty(target, key, setter, getter);
  };
}

export function QueryParamsArray<T extends any[] = string[]>(
  mapToValue: (
    params: string[],
    value: T,
    target: any,
  ) => T | string[] = identity,
  mapToString: (value: T, target: any) => string[] = (value) =>
    value.map((item) => String(item)),
) {
  return (target: any, key: string) => {
    let val: T;
    let isFirstCall = true;

    function setter(value: T): void {
      const searchParams = new URLSearchParams(location.search);
      if (isFirstCall && searchParams.has(key)) {
        val = mapToValue(searchParams.getAll(key), value, target) as T;
      } else {
        val = value;
        searchParams.delete(key);
        mapToString(value, target).forEach((item) => {
          searchParams.append(key, item);
        });
        replaceHistoryState(searchParams);
      }
      isFirstCall = false;
    }

    function getter(): T {
      return val;
    }

    defineProperty(target, key, setter, getter);
  };
}
