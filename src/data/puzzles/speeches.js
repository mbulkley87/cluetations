// person = the person who delivered the speech. This is what the cipher
// is derived from - see src/utils/cipher.js. work = the speech/event name
// (metadata only).
const speeches = [
  {
    id: 'speeches-001',
    category: 'speeches',
    quote: 'Ask not what your country can do for you. Ask what you can do for your country.',
    person: 'John F. Kennedy',
    work: '1961 Inaugural Address',
  },
  {
    id: 'speeches-002',
    category: 'speeches',
    quote: 'I have a dream that my four little children will one day live in a nation where they will not be judged by the color of their skin.',
    person: 'Martin Luther King Jr.',
    work: 'I Have a Dream',
  },
  {
    id: 'speeches-003',
    category: 'speeches',
    quote: 'There is one sign the Soviets can make that would be unmistakable, that would advance dramatically the cause of freedom and peace.',
    person: 'Ronald Reagan',
    work: 'Brandenburg Gate Address',
  },
]

export default speeches
