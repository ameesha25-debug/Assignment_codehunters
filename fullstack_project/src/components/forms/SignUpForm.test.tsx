import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import SignUpForm from './SignUpForm';

function setup(
  props?: Partial<React.ComponentProps<typeof SignUpForm>>
) {
  const onSubmit = jest.fn();
  const onSwitch = jest.fn();
  render(<SignUpForm onSubmit={onSubmit} onSwitch={onSwitch} {...props} />);

  const form = screen.getByRole('form', { name: /sign up form/i });
  const mobile = screen.getByLabelText(/mobile number/i, { selector: 'input' }) as HTMLInputElement;
  const password = screen.getByLabelText(/password/i, { selector: 'input' }) as HTMLInputElement;
  const submitBtn = screen.getByRole('button', { name: /sign up/i });

  return { user: userEvent.setup(), form, mobile, password, submitBtn, onSubmit, onSwitch };
}

describe('SignUpForm', () => {
  test('renders fields and submit button', () => {
    setup();
    expect(screen.getByRole('form', { name: /sign up form/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/mobile number/i, { selector: 'input' })).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i, { selector: 'input' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  test('sanitizes mobile to digits and clamps to 10', async () => {
    const { user, mobile } = setup();
    // Provide 11 digits mixed with non-digits so, after sanitization, we have 10 digits kept.
    await user.type(mobile, 'abc1234-56789-0xyz');
    expect(mobile.value).toBe('1234567890');
  });

  test('rejects invalid mobile length', async () => {
    const { user, mobile, password, submitBtn, onSubmit } = setup();
    await user.type(mobile, '123456789'); // only 9 digits
    await user.type(password, 'Abcdef!');
    await user.click(submitBtn);
    expect(await screen.findByText(/mobile number must be exactly 10 digits/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test('rejects password not matching 7-char uppercase+special rule', async () => {
    const { user, mobile, password, submitBtn, onSubmit } = setup();
    await user.type(mobile, '1234567890');
    await user.type(password, 'abcdef!'); // missing uppercase
    await user.click(submitBtn);
    expect(
      await screen.findByText(/password must be exactly 7 characters, include one uppercase letter and one special symbol/i)
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test('submits valid form', async () => {
    const { user, mobile, password, submitBtn, onSubmit } = setup();
    await user.type(mobile, '9876543210');
    await user.type(password, 'Abcdef!');
    await user.click(submitBtn);
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({ mobile: '9876543210', password: 'Abcdef!' });
  });

  test('shows API error from onSubmit', async () => {
    const errorMsg = 'Account exists';
    const { user, mobile, password, submitBtn } = setup({
      onSubmit: jest.fn().mockRejectedValueOnce(new Error(errorMsg)),
    });

    await user.type(mobile, '9999999999');
    await user.type(password, 'Abcdef!');
    await user.click(submitBtn);

    expect(await screen.findByText(errorMsg)).toBeInTheDocument();
  });

  test('button disables during submit and shows progress label', async () => {
    let resolvePromise: () => void;
    const slowSubmit = jest.fn(
      () =>
        new Promise<void>((res) => {
          resolvePromise = res;
        })
    );

    const { user, mobile, password } = setup({ onSubmit: slowSubmit as any });

    await user.type(mobile, '1234567890');
    await user.type(password, 'Abcdef!');
    await user.click(screen.getByRole('button', { name: /sign up/i }));

    expect(screen.getByRole('button', { name: /signing up…/i })).toBeDisabled();

    // @ts-ignore ensure resolver exists
    resolvePromise!();

    expect(await screen.findByRole('button', { name: /sign up/i })).toBeEnabled();
  });

  test('invokes onSwitch when clicking Sign in link', async () => {
    const { user, onSwitch } = setup();
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    expect(onSwitch).toHaveBeenCalledTimes(1);
  });
});
