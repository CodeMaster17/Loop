// Rasoi Planner colour tokens — warm Indian-kitchen palette, light + dark.
const light = {
  bg: '#EEE9DB', surface: '#FBF9F2', surface2: '#F2EDDF',
  ink: '#241E16', inkSoft: '#6C6353', inkFaint: '#9A907C', line: '#E1D9C5',
  green: '#1E6E4E', greenDeep: '#12503A', leaf: '#E4EEE4',
  saffron: '#D98A22', saffronInk: '#9A5E12', saffronTint: '#F7E8CC',
  chili: '#BB3A24', chiliTint: '#F5DDD5', wa: '#25D366', onWa: '#05391B', onDark: '#FFFFFF',
};
const dark = {
  bg: '#14120D', surface: '#211C14', surface2: '#2A241A',
  ink: '#F1EAD9', inkSoft: '#A99E88', inkFaint: '#7C725E', line: '#362F21',
  green: '#55B98D', greenDeep: '#78CBA4', leaf: '#1D3128',
  saffron: '#ECB25C', saffronInk: '#ECB25C', saffronTint: '#392C16',
  chili: '#E06B52', chiliTint: '#3A211A', wa: '#25D366', onWa: '#05391B', onDark: '#0E1A12',
};
export function getColors(scheme) { return scheme === 'dark' ? dark : light; }
