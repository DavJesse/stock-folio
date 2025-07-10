import { render, screen } from '@testing-library/react';
import Home from '../src/app/page';

test('renders homepage', () => {
    render(<Home />);
        
    // Assert that the instruction text is rendered
    expect(
        screen.getByText(/Get started by editing/i)
    ).toBeInTheDocument();

    // Assert that a footer link with "Learn" is present
    expect(
        screen.getByRole('link', { name: /Learn/i })
    ).toBeInTheDocument();

    // Assert that the Next.js logo is rendered by its alt text
    expect(
        screen.getByAltText(/Next\.js logo/i)
    ).toBeInTheDocument();
});
