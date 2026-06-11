export type CalculatorSeoFaqItem = {
  q: string;
  a: string;
};

export type CalculatorSeoContent = {
  heading?: string;
  intro?: string;
  howHeading?: string;
  how?: string;
  tipsHeading?: string;
  tips?: string;
  faq?: CalculatorSeoFaqItem[];
};
