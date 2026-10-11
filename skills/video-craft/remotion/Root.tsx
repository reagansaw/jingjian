// 起步项目入口：注册 ① Edit（你的口播 + edit.json）② 版式库里所有「纯文字」版式的预览（Craft-<id>，不需要任何素材）。
// 换场 / 抠像那几款要素材（占位人像视频、抠像帧），起步项目里没带——要用请看 references/text-behind-glass.md。
import React from 'react';
import { Composition } from 'remotion';
import { CRAFT_EMOTIONS, CRAFT_LAYOUTS, CRAFT_MOTIONS, CRAFT_SKELETON, CRAFT_THEMES, CRAFT_TYPO } from './craft/gallery';
import { Edit, EditProps, defaultEdit } from './Edit';

const FPS = 30;
export const Root: React.FC = () => (
  <>
    <Composition id="Edit" component={Edit as React.FC<any>} width={1080} height={1920} fps={FPS}
      durationInFrames={Math.round(defaultEdit.durationSec * FPS)} defaultProps={defaultEdit}
      calculateMetadata={({ props }) => ({ durationInFrames: Math.max(1, Math.round((props as unknown as EditProps).durationSec * FPS)) })} />
    {[...CRAFT_LAYOUTS, ...CRAFT_TYPO, ...CRAFT_SKELETON, ...CRAFT_MOTIONS, ...CRAFT_THEMES, ...CRAFT_EMOTIONS].map((l) => (
      <Composition key={l.id} id={`Craft-${l.id}`} component={l.comp} width={1080} height={1920} fps={FPS} durationInFrames={Math.round(l.dur * FPS)} />
    ))}
  </>
);
