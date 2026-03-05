import React from "react";
import classNames from "classnames";
import styles from "./HistoryScreen.module.scss";
import { Phases } from "../../types/phaseVariant";
import HomeIcon from "../HomeIcon/HomeIcon";
import { SavedGame } from "../../hooks/useHistory";
import { useLanguage } from "../../contexts/LanguageContext";
interface HistoryScreenProps {
    games: SavedGame[];
    onSelectGame: (game: SavedGame) => void;
    onHome: () => void;
}
const HistoryScreen: React.FC<HistoryScreenProps> = ({
    games,
    onSelectGame,
    onHome,
}) => {
    const { t } = useLanguage();
    return (
        <div className={classNames(styles.wrapper, styles.historyPhase)}>
            <div className={styles.container}>
                <div className={styles.box}>
                    <h2 className={styles.title}>{t('HISTORY_24H')}</h2>
                    <div className={styles.list}>
                        {games.length === 0 ? (
                            <p className={styles.emptyText}>{t('NO_HISTORY')}</p>
                        ) : (
                            games.map((g) => (
                                <div key={g.id} className={styles.gameItem} onClick={() => onSelectGame(g)}>
                                    <div className={styles.gameInfo}>
                                        <span className={styles.date}>{g.date}</span>
                                        <span className={styles.room}>{t('ROOM')}: {g.roomCode}</span>
                                        <span className={styles.host}>{t('HOST')}: {g.hostName}</span>
                                    </div>
                                    <div className={styles.arrow}>▶</div>
                                </div>
                            ))
                        )}
                    </div>
                    <div className={styles.actions}>
                        <HomeIcon onClick={onHome} className="homeIconPos" />
                    </div>
                </div>
                <div className={styles.shadow}></div>
            </div>
        </div>
    );
};
export default HistoryScreen;
