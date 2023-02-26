import Image from "next/image";
import poet from "../../assets/poet.png";
import preacher from "../../assets/preacher.png";
import prophet from "../../assets/prophet.png";

const Wid = ({
  color,
  size = "50",
  idx,
}: {
  color?: string;
  size?: string;
  idx?: number;
}) => {
  switch (idx) {
    case 1:
      return (
        <Image
          width={40}
          placeholder="blur"
          src={poet}
          alt=""
          className="left-img"
        />
      );
    case 2:
      return (
        <Image
          width={40}
          placeholder="blur"
          src={preacher}
          alt=""
          className="left-img"
        />
      );
    case 3:
      return (
        <Image
          width={40}
          placeholder="blur"
          src={prophet}
          alt=""
          className="left-img"
        />
      );

    default:
      break;
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 74"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0 0V7.4H81.2308V66.6H29.5385V74H96V66.6H88.6154V0H0ZM14.7766 11.1C10.8631 11.1136 7.11361 12.6771 4.34561 15.4494C1.57762 18.2218 0.0155682 21.9783 0 25.9C0 34.0363 6.66092 40.7 14.7766 40.7C18.6882 40.6844 22.435 39.1199 25.2002 36.3475C27.9655 33.5751 29.5248 29.8197 29.5385 25.9C29.5385 17.7711 22.8849 11.1 14.7766 11.1ZM36.9231 14.8V22.2H55.3846V14.8H36.9231ZM62.7692 14.8V22.2H73.8462V14.8H62.7692ZM14.7766 18.5C18.8898 18.5 22.1538 21.7671 22.1538 25.9C22.1538 30.044 18.8935 33.3 14.7766 33.3C10.6412 33.3 7.38462 30.044 7.38462 25.9C7.38462 21.7671 10.6449 18.5 14.7766 18.5ZM36.9231 29.6V37H73.8462V29.6H36.9231ZM0 44.4V74H7.38462V51.8H18.4615V74H25.8462V54.2346L33.4671 58.275C35.6271 59.422 38.2228 59.4183 40.3791 58.275V58.2824L53.4129 51.3745L49.968 44.8255L36.9305 51.7334L25.4991 45.6876C23.9037 44.843 22.1268 44.401 20.3225 44.4H0Z"
        fill={color}
      />
    </svg>
  );
};

export default Wid;
