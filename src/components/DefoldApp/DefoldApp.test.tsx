import React from 'react';
import { render } from '@testing-library/react';
import {screen} from '@testing-library/dom'

import { DefoldApp } from '../';

describe('DefoldApp Component', () => {
  it('renders', async () => {
    render(
      <DefoldApp root="/app/js-web/react-defold" app="reactdefold" width={640} height={360} />
    )

    screen.debug();
  });
});