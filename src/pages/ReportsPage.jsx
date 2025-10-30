import { useAuth } from '../AuthContext';

// Dentro do componente:
const { user } = useAuth();
const [vendedorId, setVendedorId] = useState(user?.relatorios_proprios_only ? user.id : '');

// No JSX:
<div className="mb-4">
    <label className="block font-medium">Vendedor:</label>
    {user?.relatorios_proprios_only ? (
        <input
            type="text"
            value={user.name}
            disabled
            className="mt-1 block w-full px-3 py-2 border rounded bg-gray-100"
        />
    ) : (
        <select
            value={vendedorId}
            onChange={e => setVendedorId(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border rounded"
        >
            <option value="">Todos</option>
            {vendedores.map(v => (
                <option key={v.id} value={v.id}>{v.name}</option>
            ))}
        </select>
    )}
</div>