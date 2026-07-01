import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  getCountryByNumericCode,
  getCountryLabel,
  getCountrySelection,
  resolveCountry,
  searchCountries,
} from "../data/countryCatalog";

const messages = {
  zh: {
    select: "请选择国家",
    search: "搜索中文、英文、韩文或国家代码",
    noResults: "没有找到匹配的国家",
    clear: "清除选择",
  },
  en: {
    select: "Select a country",
    search:
      "Search Chinese, English, Korean, or country code",
    noResults: "No matching country found",
    clear: "Clear selection",
  },
  ko: {
    select: "국가를 선택하세요",
    search: "중문, 영문, 한글 또는 국가 코드 검색",
    noResults: "일치하는 국가가 없습니다",
    clear: "선택 초기화",
  },
};

export default function CountrySearchSelect({
  label,
  language = "zh",
  value = "",
  legacyValue = "",
  required = false,
  disabled = false,
  onChange,
}) {
  const componentId = useId();
  const containerRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

  const locale =
    language === "en"
      ? "en"
      : language === "ko"
      ? "ko"
      : "zh";

  const t = messages[locale];

  const selectedCountry = useMemo(() => {
    return (
      getCountryByNumericCode(value) ||
      resolveCountry(legacyValue)
    );
  }, [value, legacyValue]);

  const options = useMemo(() => {
    return searchCountries(
      searchText,
      locale
    ).slice(0, 100);
  }, [searchText, locale]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setOpen(false);
        setSearchText("");
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        setSearchText("");
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );

      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  const handleSelect = (country) => {
    onChange?.(getCountrySelection(country));
    setOpen(false);
    setSearchText("");
  };

  const handleClear = () => {
    onChange?.(getCountrySelection(null));
    setOpen(false);
    setSearchText("");
  };

  return (
    <div
      ref={containerRef}
      className="relative"
    >
      {label ? (
        <label
          id={`${componentId}-label`}
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          {label}
          {required ? (
            <span className="ml-1 text-red-500">*</span>
          ) : null}
        </label>
      ) : null}

      <button
        type="button"
        aria-labelledby={
          label
            ? `${componentId}-label`
            : undefined
        }
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setOpen((current) => !current);
          }
        }}
        className={`flex w-full items-center justify-between rounded-xl border bg-white px-4 py-3 text-left text-sm outline-none transition ${
          disabled
            ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
            : open
            ? "border-blue-500 ring-4 ring-blue-100"
            : "border-slate-300 text-slate-700 hover:border-slate-400"
        }`}
      >
        <span
          className={
            selectedCountry
              ? "truncate text-slate-900"
              : "truncate text-slate-400"
          }
        >
          {selectedCountry
            ? getCountryLabel(
                selectedCountry,
                locale
              )
            : t.select}
        </span>

        <span className="ml-3 flex shrink-0 items-center gap-2">
          {selectedCountry ? (
            <span className="text-xs font-medium text-slate-400">
              {selectedCountry.alpha2} ·{" "}
              {selectedCountry.numeric}
            </span>
          ) : null}

          <span
            className={`text-xs text-slate-400 transition ${
              open ? "rotate-180" : ""
            }`}
          >
            ▼
          </span>
        </span>
      </button>

      {open ? (
        <div className="absolute z-50 mt-2 w-full min-w-[280px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          <div className="border-b border-slate-100 p-3">
            <input
              autoFocus
              value={searchText}
              onChange={(event) =>
                setSearchText(event.target.value)
              }
              placeholder={t.search}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div
            role="listbox"
            className="max-h-72 overflow-y-auto p-2"
          >
            {options.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm text-slate-400">
                {t.noResults}
              </div>
            ) : (
              options.map((country) => {
                const selected =
                  selectedCountry?.numeric ===
                  country.numeric;

                return (
                  <button
                    key={country.alpha2}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() =>
                      handleSelect(country)
                    }
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition ${
                      selected
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-medium">
                        {getCountryLabel(
                          country,
                          locale
                        )}
                      </span>

                      <span className="mt-0.5 block truncate text-xs text-slate-400">
                        {country.names.en}
                      </span>
                    </span>

                    <span className="ml-3 shrink-0 text-xs font-medium text-slate-400">
                      {country.alpha2} ·{" "}
                      {country.alpha3} ·{" "}
                      {country.numeric}
                    </span>
                  </button>
                );
              })
            )}
          </div>

          {!required && selectedCountry ? (
            <div className="border-t border-slate-100 p-2">
              <button
                type="button"
                onClick={handleClear}
                className="w-full rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                {t.clear}
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}