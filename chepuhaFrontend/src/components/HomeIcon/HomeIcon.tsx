import homeImage from "../../assets/images/house.png";

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
