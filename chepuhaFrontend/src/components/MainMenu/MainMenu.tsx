import React from 'react';
import classNames from 'classnames';
import Button from '../Button/Button';
import { Phases } from '../../types/phaseVariant';
import './MainMenu.scss';

export interface MainMenuProps {
  language: string;
  logoImage: string;
  logoImageEng: string;
  logoPop: boolean;
  triggerLogoPop: () => void;
  t: (key: string) => string | any;
  phase: Phases;
  doShowCreateScreen: () => void;
  doShowJoinScreen: () => void;
  doShowHistory: () => void;
  setLanguage: (lang: string) => void;
  flagUk: string;
  flagEn: string;
}

const MainMenu: React.FC<MainMenuProps> = ({
  language,
  logoImage,
  logoImageEng,
  logoPop,
  triggerLogoPop,
  t,
  phase,
  doShowCreateScreen,
  doShowJoinScreen,
  doShowHistory,
  setLanguage,
  flagUk,
  flagEn,
}) => {
  return (
    <>
      <div className="logo-wrapper">
        <img
          src={language === 'en' ? logoImageEng : logoImage}
          alt="Чепуха Лого"
          className={classNames('logo', { 'logo-pop-active': logoPop })}
        />
        <div className="logo-boy-hitbox hitbox-1" onClick={triggerLogoPop} />
        <div className="logo-boy-hitbox hitbox-2" onClick={triggerLogoPop} />
        <div className="logo-boy-hitbox hitbox-3" onClick={triggerLogoPop} />
      </div>
      <div className="menu-buttons">
        <Button
          label={t('CREATE_GAME')}
          variant="primary"
          phase={phase}
          onClick={doShowCreateScreen}
        />
        <Button
          label={t('JOIN_GAME')}
          variant="primary"
          phase={phase}
          onClick={doShowJoinScreen}
        />
        <Button
          label={t('HISTORY')}
          variant="primary"
          phase={phase}
          onClick={doShowHistory}
        />
      </div>
      <div className="language-selector">
        <button
          className={`lang-btn ${language === 'uk' ? 'active' : ''}`}
          onClick={() => setLanguage('uk')}
        >
          <img src={flagUk} alt="UK" />
        </button>
        <button
          className={`lang-btn ${language === 'en' ? 'active' : ''}`}
          onClick={() => setLanguage('en')}
        >
          <img src={flagEn} alt="EN" />
        </button>
      </div>
    </>
  );
};

export default MainMenu;
