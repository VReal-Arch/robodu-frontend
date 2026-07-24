/**
 * Institution credits shown at the bottom of the dashboard.
 *
 * The PNGs in /public/logos are white silhouettes used as CSS masks, so the
 * colour comes from `background-color` and follows the light/dark theme.
 * Heights are tuned per mark (not uniform) so they look optically balanced —
 * the square ERC mark would otherwise dominate the wide wordmarks.
 */
const LOGOS = [
  { file: "logo-elins.png", alt: "ELINS UGM", height: 42, ratio: 671 / 168 },
  { file: "logo-esr.png", alt: "Embedded Systems and Robotics Laboratory", height: 53, ratio: 330 / 198 },
  { file: "logo-mei.png", alt: "Magister Elektronika dan Instrumentasi UGM", height: 48, ratio: 479 / 180 },
  { file: "logo-erc.png", alt: "Elins Research Club", height: 50, ratio: 1 },
];

export default function PartnerLogos() {
  return (
    <div className="card partners">
      <div className="partners-label">Presented by</div>
      <div className="partners-row">
        {LOGOS.map((l) => {
          const url = `/logos/${l.file}`;
          return (
            <div
              key={l.file}
              className="plogo"
              role="img"
              aria-label={l.alt}
              title={l.alt}
              style={{
                width: Math.round(l.height * l.ratio),
                height: l.height,
                WebkitMaskImage: `url(${url})`,
                maskImage: `url(${url})`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
