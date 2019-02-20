export const mockArticle = {
  title: 'The girl named Princess',
  description: 'The girl named Princess fell from the skies and just disappeared',
  body: 'When Princess was a little girl, she liked to read books and ...',
  references: ['princess.com', 'example.com'],
  categoryId: 1
};

export const mockArticle2 = {
  title: 'The girl named Princess',
  description: 'The girl named Princess fell from the skies and just disappeared',
  body: 'When Princess was a little girl, she liked to read books and ...',
  references: ['princess.com', 'example.com'],
  categoryId: 7
};

export const mockComment = {
  commentBody: 'I comment by reserve'
};

export const invalidArticle = {
  description: 'The girl named Princess fell from the skies and just disappeared',
  references: ['princess.com', 'example.com'],
};

export const invalidUpdateArticle = {
  slug: 'Oops',
  description: 'Just',
  body: 'Just Saying',
  categoryId: 0
};

export const mockHighlight = {
  highlight: 'Mock Highlight',
  comment: 'Mock Comment'
};

export const InvalidHighlight = {
  highlight: '',
  comment: 'Mock Comment'
};

export const mockTaggedArticle = {
  title: 'The girl named Princess',
  description: 'The girl named Princess fell from the skies and just disappeared',
  body: 'When Princess was a little girl, she liked to read books and ...',
  tags: 'andela, princess',
  categoryId: 1
};
