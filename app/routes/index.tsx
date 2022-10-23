import { Link } from 'react-router-dom';

export default function Index() {
  return (
    <div className="w-full flex flex-col items-center justify-center gap-20">
      <div className="mt-10 flex flex-col gap-2">
        <h1 className="text-red-700 text-4xl">Welcome to my website!</h1>
        <p>I am so glad you swung by to check this out!</p>
        <nav>
          <ul className="flex flex-row items-center justify-center gap-6">
            <li>
              <Link className="underline hover:bg-red-700" to="/message-board">
                Message board
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
