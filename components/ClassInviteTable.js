export default function ClassInviteTable({ classes }) {
  return (
    <>
      <div className={'p-5'}>
        <a
          href='#'
          className='group block max-w-xl mx-auto p-6 bg-[#d0d0d5] border-4 border-[#0a0a23] ring-1 ring-slate-900/5 shadow-lg space-y-3 hover:bg-[#0a0a23] hover:ring-sky-500'
        >
          <div className='flex items-center space-x-3'>
            <h3 className='text-slate-900 group-hover:text-white text-sm font-semibold'>
              Classroom: {classes.classroomName}
            </h3>
          </div>
          <p className='group-hover:text-white text-sm'>
            Invite Code: {classes.classroomId}
          </p>
        </a>
      </div>
    </>
  );
}
