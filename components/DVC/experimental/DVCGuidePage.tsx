type Props = {
  styles: string;
  body: string;
};

/** Renders guide HTML with scoped styles (landing, year, month index) */
export default function DVCGuidePage({ styles, body }: Props) {
  return (
    <div className="dvc-guide-root">
      {styles ? <style dangerouslySetInnerHTML={{ __html: styles }} /> : null}
      <div dangerouslySetInnerHTML={{ __html: body }} />
    </div>
  );
}
