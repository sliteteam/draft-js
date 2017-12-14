/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails oncall+ui_infra
 * @format
 * @flow
 */

'use strict';

jest.disableAutomock();

jest.mock('generateRandomKey');

const ContentBlock = require('ContentBlock');
const ContentBlockNode = require('ContentBlockNode');
const ContentState = require('ContentState');
const EditorState = require('EditorState');
const Immutable = require('immutable');

const moveBlockInContentState = require('moveBlockInContentState');

const {List} = Immutable;

const contentBlocks = [
  new ContentBlock({
    key: 'A',
    text: 'Alpha',
  }),
  new ContentBlock({
    key: 'B',
    text: 'Beta',
  }),
  new ContentBlock({
    key: 'C',
    text: 'Charlie',
  }),
];

const contentBlockNodes = [
  new ContentBlockNode({
    key: 'A',
    text: 'Alpha',
    nextSibling: 'B',
  }),
  new ContentBlockNode({
    key: 'B',
    text: '',
    children: List(['C']),
    nextSibling: 'D',
    prevSibling: 'A',
  }),
  new ContentBlockNode({
    key: 'C',
    parent: 'B',
    text: 'Charlie',
  }),
  new ContentBlockNode({
    key: 'D',
    text: '',
    prevSibling: 'B',
    children: List(['E']),
  }),
  new ContentBlockNode({
    key: 'E',
    parent: 'D',
    text: 'Elephant',
  }),
];

const assertMoveBlockInContentState = (
  blockToBeMovedKey,
  targetBlockKey,
  insertionMode,
  blocksArray = contentBlocks,
) => {
  const editor = EditorState.createWithContent(
    ContentState.createFromBlockArray(blocksArray),
  );
  const contentState = editor.getCurrentContent();
  const blockToBeMoved = contentState.getBlockForKey(blockToBeMovedKey);
  const targetBlock = contentState.getBlockForKey(targetBlockKey);

  expect(
    moveBlockInContentState(
      contentState,
      blockToBeMoved,
      targetBlock,
      insertionMode,
    )
      .getBlockMap()
      .toSetSeq()
      .toArray()
      // doing this filtering to make the snapshot more precise/concise in what we test
      .map(filter => {
        const {
          data,
          characterList,
          depth,
          type,
          text,
          ...other
        } = filter.toJS();
        return other;
      }),
  ).toMatchSnapshot();
};

test('must be able to move block before other block', () => {
  assertMoveBlockInContentState('C', 'A', 'before');
});

test('must be able to move block after other block', () => {
  assertMoveBlockInContentState('A', 'C', 'after');
});

test('must be able to move nested block before other block', () => {
  assertMoveBlockInContentState('C', 'A', 'before', contentBlockNodes);
});

test('must be able to move block before other nested block', () => {
  assertMoveBlockInContentState('A', 'C', 'before', contentBlockNodes);
});

test('must be able to move nested block after other block', () => {
  assertMoveBlockInContentState('C', 'A', 'after', contentBlockNodes);
});

test('must be able to move block after other nested block', () => {
  assertMoveBlockInContentState('A', 'C', 'after', contentBlockNodes);
});

test('must be able to move block and its children before other block', () => {
  assertMoveBlockInContentState('B', 'A', 'before', contentBlockNodes);
});

test('must be able to move block and its children after other block', () => {
  assertMoveBlockInContentState('D', 'A', 'after', contentBlockNodes);
});

test('must be able to move block and its children before other nested block', () => {
  assertMoveBlockInContentState('D', 'C', 'before', contentBlockNodes);
});

test('must be able to move block and its children after other nested block', () => {
  assertMoveBlockInContentState('B', 'E', 'after', contentBlockNodes);
});
