// components/Footer.js
export default function Footer() {
    return (
      <footer className="footer bg-dark text-white py-4">
        <div className="container">
          <p className="mb-0 text-center">
            © {new Date().getFullYear()} PortaCloud
          </p>
        </div>
      </footer>
    );
  }
  