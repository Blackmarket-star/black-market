import DatePicker from "react-multi-date-picker";
import DateObject from "react-date-object";
import "react-multi-date-picker/styles/backgrounds/bg-dark.css";
import { persian, persian_fa, persian_en } from "@/lib/jalali";

type Props = {
  value: string;
  onChange: (jalaliString: string) => void;
  placeholder?: string;
  disabled?: boolean;
};

/** A Shamsi (Jalali) date picker returning "YYYY/MM/DD" (Latin digits). */
export default function JalaliDatePicker({
  value,
  onChange,
  placeholder = "انتخاب تاریخ",
  disabled,
}: Props) {
  const dateObject = value
    ? new DateObject({ date: value, calendar: persian, locale: persian_en })
    : null;

  return (
    <div className="rmdp-wrap w-full">
      <DatePicker
        value={dateObject}
        disabled={disabled}
        calendar={persian}
        locale={persian_fa}
        format="YYYY/MM/DD"
        calendarPosition="bottom-right"
        placeholder={placeholder}
        inputClass="rmdp-input-custom"
        onChange={(val) => {
          if (val instanceof DateObject) {
            const latin = new DateObject({
              date: val,
              calendar: persian,
              locale: persian_en,
            }).format("YYYY/MM/DD");
            onChange(latin);
          } else if (val === null) {
            onChange("");
          }
        }}
      />
    </div>
  );
}
