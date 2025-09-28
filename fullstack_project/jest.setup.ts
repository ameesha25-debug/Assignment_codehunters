import '@testing-library/jest-dom';

// Polyfill TextEncoder/TextDecoder for Jest Node environment (needed by react-router-dom)
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
