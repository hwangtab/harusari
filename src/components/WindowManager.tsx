'use client';

import { useStore } from '@/store/useStore';
import { AnimatePresence } from 'framer-motion';
import Window from './Window';
import AlbuminfoWindow from './windows/AlbuminfoWindow';
import CreditWindow from './windows/CreditWindow';
import CriticWindow from './windows/CriticWindow';
import SpecialThanksWindow from './windows/SpecialThanksWindow';
import SketchbookWindow from './windows/SketchbookWindow';
import QuizWindow from './windows/QuizWindow';
import SecretTxtWindow from './windows/SecretTxtWindow';
import MusicPlayerWindow from './windows/MusicPlayerWindow';
import ImageViewerWindow from './windows/ImageViewerWindow';
import LyricsWindow from './windows/LyricsWindow';
import AboutWindow from './windows/AboutWindow';

const windowComponents = {
  AlbuminfoWindow,
  CreditWindow,
  CriticWindow,
  SpecialThanksWindow,
  SketchbookWindow,
  QuizWindow,
  SecretTxtWindow,
  MusicPlayerWindow,
  ImageViewerWindow,
  LyricsWindow,
  AboutWindow
};

export default function WindowManager() {
  const { windows } = useStore();

  const renderWindowContent = (windowData: { id: string; component: string }) => {
    const ComponentName = windowData.component as keyof typeof windowComponents;
    const Component = windowComponents[ComponentName];
    
    if (!Component) {
      return <div>Unknown window type: {windowData.component}</div>;
    }
    
    return <Component windowId={windowData.id} />;
  };

  return (
    <AnimatePresence>
      {windows.map((windowData) => (
        <Window key={windowData.id} window={windowData}>
          {renderWindowContent(windowData)}
        </Window>
      ))}
    </AnimatePresence>
  );
}