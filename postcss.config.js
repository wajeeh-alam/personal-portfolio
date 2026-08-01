/**
 * PostCSS pipeline: Tailwind first (it generates the utility layers), then
 * Autoprefixer over the generated output.
 */
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
