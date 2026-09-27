/**
 * Tafqeet: Convert numbers into Arabic words for invoices and financial receipts.
 */

const ones = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة', 'عشرة', 'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر'];
const tens = ['', '', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
const hundreds = ['', 'مائة', 'مائتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة'];

function convertLessThanThousand(n: number): string {
  if (n === 0) return '';
  if (n < 20) return ones[n];
  if (n < 100) {
    const o = n % 10;
    const t = Math.floor(n / 10);
    return (o > 0 ? ones[o] + ' و' : '') + tens[t];
  }
  const h = Math.floor(n / 100);
  const rem = n % 100;
  return hundreds[h] + (rem > 0 ? ' و' + convertLessThanThousand(rem) : '');
}

export function tafqeet(amount: number, currencyName = 'جنيه مصري', fractionalName = 'قرش'): string {
  if (amount === 0) return 'صفر ' + currencyName;

  const integerPart = Math.floor(Math.abs(amount));
  const decimalPart = Math.round((Math.abs(amount) - integerPart) * 100);

  let result = '';

  const billions = Math.floor(integerPart / 1000000000);
  const millions = Math.floor((integerPart % 1000000000) / 1000000);
  const thousands = Math.floor((integerPart % 1000000) / 1000);
  const remainder = integerPart % 1000;

  const parts: string[] = [];

  if (billions > 0) {
    if (billions === 1) parts.push('مليار');
    else if (billions === 2) parts.push('ملياران');
    else if (billions <= 10) parts.push(convertLessThanThousand(billions) + ' مليارات');
    else parts.push(convertLessThanThousand(billions) + ' مليار');
  }

  if (millions > 0) {
    if (millions === 1) parts.push('مليون');
    else if (millions === 2) parts.push('مليونان');
    else if (millions <= 10) parts.push(convertLessThanThousand(millions) + ' ملايين');
    else parts.push(convertLessThanThousand(millions) + ' مليون');
  }

  if (thousands > 0) {
    if (thousands === 1) parts.push('ألف');
    else if (thousands === 2) parts.push('ألفان');
    else if (thousands <= 10) parts.push(convertLessThanThousand(thousands) + ' آلاف');
    else parts.push(convertLessThanThousand(thousands) + ' ألف');
  }

  if (remainder > 0) {
    parts.push(convertLessThanThousand(remainder));
  }

  result = 'فقط ' + parts.join(' و') + ' ' + currencyName;

  if (decimalPart > 0) {
    result += ' و' + convertLessThanThousand(decimalPart) + ' ' + fractionalName;
  }

  result += ' لا غير';
  return result;
}
