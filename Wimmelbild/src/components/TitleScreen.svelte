<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    let password = '';
    let maxRounds = '';
    let error = false;

    function handleSubmit() {
        if (password === 'poke') {
            const rounds = maxRounds ? parseInt(maxRounds+1) : undefined;
            dispatch('start', { maxRounds: rounds });
        } else {
            error = true;
            password = '';
        }
    }
</script>

<div class="title-screen">
    <div class="title-content">
        <h1>Poke-Wimmelbild</h1>
        <form on:submit|preventDefault={handleSubmit}>
            <div class="input-group">
                <input
                    type="password"
                    bind:value={password}
                    placeholder="Enter password"
                    class:error
                    on:input={() => error = false}
                />
                {#if error}
                    <p class="error-message">Incorrect password</p>
                {/if}
            </div>
            <div class="input-group">
                <input
                    type="number"
                    bind:value={maxRounds}
                    placeholder="Maximale Anzahl Runden"
                    min="1"
                    class="rounds-input"
                />
                <p class="hint-text">Leer lassen für unendlich viele Runden</p>
            </div>
            <button type="submit">Start</button>
        </form>
    </div>
</div>

<style>
    .title-screen {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #1e3b70 0%, #29539b 100%);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 3000;
    }

    .title-content {
        background: white;
        padding: 2rem;
        border-radius: 1rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        text-align: center;
        max-width: 90%;
        width: 400px;
    }

    h1 {
        color: #1e3b70;
        font-size: 2.5rem;
        margin-bottom: 2rem;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
    }

    .input-group {
        margin-bottom: 1rem;
    }

    input {
        width: 100%;
        padding: 0.8rem;
        border: 2px solid #ddd;
        border-radius: 0.5rem;
        font-size: 1rem;
        outline: none;
        transition: border-color 0.2s;
    }

    input:focus {
        border-color: #29539b;
    }

    input.error {
        border-color: #ff4444;
    }

    .error-message {
        color: #ff4444;
        margin: 0.5rem 0;
        font-size: 0.9rem;
    }

    button {
        background: #4CAF50;
        color: white;
        border: none;
        padding: 0.8rem 1.5rem;
        border-radius: 0.5rem;
        font-size: 1.1rem;
        cursor: pointer;
        transition: background-color 0.2s, transform 0.2s;
        width: 100%;
    }

    button:hover {
        background: #45a049;
        transform: scale(1.02);
    }

    .rounds-input {
        width: 100%;
        padding: 0.8rem;
        border: 2px solid #ddd;
        border-radius: 0.5rem;
        font-size: 1rem;
        outline: none;
        transition: border-color 0.2s;
        margin-bottom: 0.5rem;
    }

    .rounds-input:focus {
        border-color: #29539b;
    }

    .hint-text {
        color: #666;
        font-size: 0.8rem;
        margin: 0;
        text-align: left;
    }

    .input-group + .input-group {
        margin-top: 1rem;
    }
</style> 