import homeImage from "../../assets/images/icon_home.png";

interface HomeIconProps {
    onClick: () => void;
    className?: string;
}

const HomeIcon = ({ onClick, className }: HomeIconProps) => (
    <div className={className} onClick={onClick}>
        <img
            src={homeImage}
            alt="Home"
        />
    </div>
);

export default HomeIcon;