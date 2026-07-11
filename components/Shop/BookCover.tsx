import type { StoreBook } from "../../lib/store/types";
import { catColor } from "../../lib/store/helpers";

type Props = {
  book: StoreBook;
  size?: "sm" | "lg";
};

export default function BookCover({ book, size = "sm" }: Props) {
  const w = size === "lg" ? 300 : 190;
  const h = Math.round(w * 1.5);
  const d = Math.round(w * 0.12);
  const fs = size === "lg" ? 22 : 14;
  const c = catColor(book.category);

  return (
    <div className="book3d-stage">
      <div className="book3d">
        {book.coverImage ? (
          <div className="cover has-img" style={{ width: w, height: h }}>
            <img src={book.coverImage} alt={`${book.title} cover`} />
          </div>
        ) : (
          <div
            className="cover"
            style={{
              width: w,
              height: h,
              fontSize: fs,
              background: `linear-gradient(160deg,${c.tone},${c.deep} 72%)`,
            }}
          >
            <div className="cover-frame" />
            <div className="cover-top">
              <div className="cover-kicker">{book.kicker || book.category}</div>
              <div className="cover-title">{book.title}</div>
              <div className="cover-sub">{book.subtitle || ""}</div>
            </div>
            <div className="cover-bottom">
              <div className="cover-orn">✦ ✦ ✦</div>
              <div className="cover-author">Emmanuel I. Emodiae</div>
              <div className="cover-brand">eemodiae.org · @thehjcw</div>
            </div>
          </div>
        )}
        <div className="spine" style={{ width: d }} aria-hidden="true" />
        <div className="pages" style={{ width: d - 2 }} aria-hidden="true" />
      </div>
    </div>
  );
}
