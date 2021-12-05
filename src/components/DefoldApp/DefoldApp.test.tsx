import React from 'react';
import { render } from '@testing-library/react';
import {screen} from '@testing-library/dom'

import DefoldApp from './DefoldApp';

describe('DefoldApp Component', () => {
  it('renders', async () => {
    render(
      <DefoldApp root="/meteoroids" app="meoteoroids" width={640} height={1136} />
    )

    screen.debug();
  });
});