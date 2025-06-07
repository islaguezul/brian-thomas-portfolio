import { sql } from '@vercel/postgres';
import { Database, AlertCircle, CheckCircle } from 'lucide-react';
import InitializeButton from '@/components/admin/InitializeButton';
import RunMigrationsButton from '@/components/admin/RunMigrationsButton';
import SeedButton from '@/components/admin/SeedButton';

async function checkDatabaseStatus() {
  try {
    // Check if tables exist
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `;

    const expectedTables = [
      'personal_info', 'projects', 'project_technologies', 'project_features',
      'project_impacts', 'project_challenges', 'project_outcomes', 'project_screenshots',
      'work_experience', 'work_responsibilities', 'education', 'education_courses',
      'tech_stack', 'skill_categories', 'skills', 'process_strategy',
      'site_metrics', 'admin_users'
    ];

    const existingTables = tables.rows.map(row => row.table_name);
    const missingTables = expectedTables.filter(table => !existingTables.includes(table));

    // Check if data exists
    const hasData = existingTables.length > 0 ? 
      await sql`SELECT EXISTS(SELECT 1 FROM personal_info)` : 
      { rows: [{ exists: false }] };

    return {
      connected: true,
      tablesExist: missingTables.length === 0,
      missingTables,
      hasData: hasData.rows[0].exists,
      tableCount: existingTables.length
    };
  } catch (error) {
    console.error('Database check error:', error);
    return {
      connected: false,
      tablesExist: false,
      missingTables: [],
      hasData: false,
      tableCount: 0
    };
  }
}

export default async function DatabasePage() {
  const status = await checkDatabaseStatus();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Database Management</h1>
        <p className="text-gray-400">Initialize and manage your portfolio database</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <Database className="w-5 h-5 text-blue-400" />
          Database Status
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
            <span className="text-gray-300">Connection Status</span>
            <div className="flex items-center gap-2">
              {status.connected ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-green-400">Connected</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <span className="text-red-400">Not Connected</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
            <span className="text-gray-300">Tables Created</span>
            <div className="flex items-center gap-2">
              {status.tablesExist ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-green-400">All {status.tableCount} tables exist</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-400">{status.tableCount} tables found</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
            <span className="text-gray-300">Data Status</span>
            <div className="flex items-center gap-2">
              {status.hasData ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-green-400">Data populated</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-400">No data</span>
                </>
              )}
            </div>
          </div>
        </div>

        {status.missingTables.length > 0 && (
          <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-yellow-400 text-sm mb-2">Missing tables:</p>
            <ul className="text-yellow-400/80 text-sm list-disc list-inside">
              {status.missingTables.map(table => (
                <li key={table}>{table}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Database Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">Setup</h4>
            <InitializeButton />
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">Migration</h4>
            <RunMigrationsButton />
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">Sample Data</h4>
            <SeedButton />
          </div>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Database Information</h3>
        <div className="space-y-2 text-sm">
          <p className="text-gray-400">
            <span className="text-gray-300">Provider:</span> Vercel Postgres
          </p>
          <p className="text-gray-400">
            <span className="text-gray-300">Region:</span> Auto (closest to your deployment)
          </p>
          <p className="text-gray-400">
            <span className="text-gray-300">Pricing:</span> Free tier (includes 60 hours compute time/month)
          </p>
          <p className="text-gray-400">
            <span className="text-gray-300">Storage:</span> 256 MB included
          </p>
        </div>
      </div>
    </div>
  );
}