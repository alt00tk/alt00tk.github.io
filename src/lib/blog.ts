function subMillisecondFraction(publishedAt: string): string {
  const fractionalSeconds = publishedAt.match(/\.(\d+)(?=(?:Z|[+-]\d{2}:?\d{2})$)/)?.[1] ?? "";
  return fractionalSeconds.slice(3).replace(/0+$/, "");
}

function comparePublishedAtDescending(left: string, right: string): number {
  const leftMilliseconds = Date.parse(left);
  const rightMilliseconds = Date.parse(right);
  if (leftMilliseconds !== rightMilliseconds) {
    return rightMilliseconds - leftMilliseconds;
  }

  // Date parses only millisecond precision; preserve any remaining validated ISO fraction.
  const leftFraction = subMillisecondFraction(left);
  const rightFraction = subMillisecondFraction(right);
  const precision = Math.max(leftFraction.length, rightFraction.length);
  const leftRemainder = leftFraction.padEnd(precision, "0");
  const rightRemainder = rightFraction.padEnd(precision, "0");

  if (leftRemainder === rightRemainder) {
    return 0;
  }

  return leftRemainder > rightRemainder ? -1 : 1;
}

export function sortArticlesByPublishedAt<T extends { data: { publishedAt: string } }>(
  articles: readonly T[],
): T[] {
  return [...articles].sort((left, right) =>
    comparePublishedAtDescending(left.data.publishedAt, right.data.publishedAt),
  );
}

export function formatPublishedAt(publishedAt: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(publishedAt));
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value;
  const year = part("year");
  const month = part("month");
  const day = part("day");

  if (!year || !month || !day) {
    throw new Error(`Unable to format publishedAt "${publishedAt}" in Asia/Tokyo.`);
  }

  return `${year.padStart(4, "0")}.${month}.${day}`;
}
