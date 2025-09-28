import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import SignInForm from './SignInForm';

function setup(
  props?: Partial<React.ComponentProps<typeof SignInForm>>
) {
  const onSubmit = jest.fn();
  const onSwitch = jest.fn();
  render(<SignInForm onSubmit={onSubmit} onSwitch={onSwitch} {...props} />);

  const form = screen.getByRole('form', { name: /sign in form/i });
  const mobile = screen.getByLabelText(/mobile number/i, { selector: 'input' }) as HTMLInputElement;
  const password = screen.getByLabelText(/password/i, { selector: 'input' }) as HTMLInputElement;
  const submitBtn = screen.getByRole('button', { name: /sign in/i });

  return { user: userEvent.setup(), form, mobile, password, submitBtn, onSubmit, onSwitch };
}

describe('SignInForm', () => {
  test('renders fields with labels and submit button', () => {
    setup();
    expect(screen.getByRole('form', { name: /sign in form/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/mobile number/i, { selector: 'input' })).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i, { selector: 'input' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  test('types mobile and password and submits trimmed mobile', async () => {
    const { user, mobile, password, submitBtn, onSubmit } = setup();

    await user.type(mobile, ' 9876543210 ');
    await user.type(password, 'P@ssw0rd!');
    await user.click(submitBtn);

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({ mobile: '9876543210', password: 'P@ssw0rd!' });
  });

  test('shows error text when onSubmit throws', async () => {
    const errorMsg = 'Invalid credentials';
    const { user, mobile, password } = setup({
      onSubmit: jest.fn().mockRejectedValueOnce(new Error(errorMsg)),
    });

    await user.type(mobile, '9999999999');
    await user.type(password, 'Secret123!');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

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

    const { user } = setup({ onSubmit: slowSubmit as any });

    await user.type(screen.getByLabelText(/mobile number/i, { selector: 'input' }), '8888888888');
    await user.type(screen.getByLabelText(/password/i, { selector: 'input' }), 'Secret123!');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    // Button should show loading text and be disabled while promise pending
    expect(screen.getByRole('button', { name: /signing in…/i })).toBeDisabled();

    // Finish the promise
    // @ts-ignore
    resolvePromise!();

    // After completion, normal label returns and button enabled
    expect(await screen.findByRole('button', { name: /sign in/i })).toBeEnabled();
  });

  test('toggle password show/hide via aria-label', async () => {
    const { user } = setup();
    const pwdInput = screen.getByLabelText(/password/i, { selector: 'input' }) as HTMLInputElement;

    // Initially masked
    expect(pwdInput).toHaveAttribute('type', 'password');

    const toggleBtn = screen.getByRole('button', { name: /show password/i });
    await user.click(toggleBtn);
    expect(pwdInput).toHaveAttribute('type', 'text');

    // Button label changes to Hide password
    await user.click(screen.getByRole('button', { name: /hide password/i }));
    expect(pwdInput).toHaveAttribute('type', 'password');
  });

  test('required inputs prevent empty submit (native validation)', async () => {
    const { user, submitBtn, onSubmit } = setup();
    await user.click(submitBtn);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test('invokes onSwitch when clicking Sign up link', async () => {
    const { user, onSwitch } = setup();
    await user.click(screen.getByRole('button', { name: /sign up/i }));
    expect(onSwitch).toHaveBeenCalledTimes(1);
  });
});
