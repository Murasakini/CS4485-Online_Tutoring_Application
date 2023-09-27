export function Profile() {
  const avatar = "https://i.imgur.com/QIrZWGIs.jpg";
  const name = "Alan L. Hart";
  return (
    <img
      src= {avatar}
      alt= {name}
    />
  );
}

export default function Gallery() {
  return (
    <section>
      <h1>Amazing scientists</h1>
      <Profile />
      <Profile />
      <Profile />
    </section>
  );
}

