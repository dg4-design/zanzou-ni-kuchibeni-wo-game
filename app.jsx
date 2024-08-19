const App = () => {
  return <div>Hello World</div>;
};

const target = document.getElementById("app");
const root = ReactDOM.createRoot(target);
root.render(<App />);
