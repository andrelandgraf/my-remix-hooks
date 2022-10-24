import { ActionArgs, json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { addEntry, updateLikes, getAllEntries } from '~/db.server';
import type { Entry } from '~/types';

async function handleNewMessage(formData: FormData) {
  const name = formData.get('name');
  const message = formData.get('message');
  if (!name || !message || typeof name !== 'string' || typeof message !== 'string') {
    return json({ error: 'Please fill out all fields' }, { status: 400 });
  }
  try {
    await addEntry(name, message);
    return json({ success: true });
  } catch (error) {
    return json({ error: error?.toString() || 'Something went wrong' }, { status: 500 });
  }
}

async function handleUpdateLikesBy(formData: FormData, byValue: number) {
  const id = formData.get('id');
  if (!id || typeof id !== 'string') {
    return json({ error: 'Ups, something went wrong! No Id.' }, { status: 500 });
  }
  try {
    await updateLikes(id, byValue);
    return json({ success: true });
  } catch (error) {
    return json({ error: error?.toString() || 'Something went wrong' }, { status: 500 });
  }
}

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get('intent');
  if (intent === 'new') {
    return handleNewMessage(formData);
  }
  if (intent === 'upVote') {
    return handleUpdateLikesBy(formData, 1);
  }
  if (intent === 'downVote') {
    return handleUpdateLikesBy(formData, -1);
  }
  return json({ error: 'Ups, something went wrong! Unknown intent.' }, { status: 500 });
}

export async function loader() {
  const entries = await getAllEntries();
  return json({ entries });
}

function MessageEntry({ entry }: { entry: Entry }) {
  return (
    <li className="w-full max-w-xl flex flex-row items-center justify-center gap-6 bg-gray-300 p-4">
      <div className="flex flex-col gap-1 mr-auto">
        <p>{entry.message}</p>
        <p>
          <small className="text-gray-600 text-sm">By {entry.name}</small>
        </p>
      </div>
      <form method="post" action="/message-board" className="flex flex-col gap-1">
        <button type="submit" name="intent" value="upVote">
          ⬆️
        </button>
        <div>
          <input type="hidden" name="id" value={entry.id} />
          <p>{entry.likes} likes</p>
        </div>
        <button type="submit" name="intent" value="downVote">
          ⬇️
        </button>
      </form>
    </li>
  );
}

/**
 * I love GitHub Copilot
 */
function withOrdinal(n: number) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function MessageForm() {
  const { entries } = useLoaderData<typeof loader>();
  return (
    <form method="post" action="/message-board" className="w-full flex flex-col items-center justify-center gap-2">
      <div className="text-center">
        <h2 className="text-2xl">Add a message</h2>
        <p>Please leave a message and say hi!</p>
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="name-input">Name:</label>
        <input type="text" id="name-input" name="name" className="border-2 border-red-700" required />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="message-input">Message</label>
        <textarea id="message-input" name="message" className="border-2 border-red-700" required />
      </div>
      <button type="submit" name="intent" value="new" className="p-2 bg-red-700 text-white font-bold hover:bg-red-600">
        Submit {withOrdinal(entries.length + 1)} message!
      </button>
    </form>
  );
}

export default function MessageBoard() {
  const { entries } = useLoaderData<typeof loader>();
  return (
    <main className="w-full flex flex-col items-center justify-center gap-10">
      <div className="mt-10 text-center flex flex-col gap-2">
        <h1 className="text-red-700 text-4xl">Visitor Message Board</h1>
        <p>Messages from past visitors.</p>
      </div>
      <div className="flex flex-col lg:flex-row items-center justify-center lg:items-start lg:justify-start gap-10">
        <section className="w-full">
          <MessageForm />
        </section>
        <section className="w-full flex flex-col items-center justify-center gap-4">
          <div className="text-center">
            <h2 className="text-2xl">Add a message</h2>
            <p>Please leave a message and say hi!</p>
          </div>
          <ul className="w-full flex flex-col items-center justify-center gap-2">
            {entries.map((entry) => (
              <MessageEntry key={entry.id} entry={entry as any} />
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
