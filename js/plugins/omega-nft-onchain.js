/* ===================================
   OMEGA NFT MINTER - ON-CHAIN VERSION
   Deploys ERC-721 and mints to Omega Network
   =================================== */

console.log('🎨 Loading Omega NFT On-Chain Minter v3.0 (Pinata)...');

(function() {
    
    // Pinata API
    const PINATA_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI1ZTBlODA0ZC04ZmFiLTRmYTgtYTFkOS00N2YxOGMzMzQ1YTkiLCJlbWFpbCI6Im9tZWdhQG9tZWdhbmV0d29yay5jbyIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiJlZjViMjUwYWVhNzQ1NDJlZWYwZiIsInNjb3BlZEtleVNlY3JldCI6ImFhMzFhYzkzZjUyZTE1ZTU2ZTRmZjFiOWY0NWUzNTM0YTNiY2VhMmVlOTBlYzQ0MzJmOGU2MTkyYjc5Y2IxYzEiLCJleHAiOjE3OTE0MDM3MjN9.WklMofSEKmJc_k6KSlK6JmTW3eKhTSFjUHp_X9mneC4';
    
    console.log('✅ NFT Minter v3.0 loaded with Pinata integration');
    
    // Deployed contract on Omega Network
    const OMEGA_NFT_CONTRACT = '0x3aa39fe2dab93838ed3ad314b8867a8792902dd7';
    
    const CONTRACT_ABI = [
        "function mint(address to, string memory tokenURI) public returns (uint256)",
        "function tokenURI(uint256 tokenId) public view returns (string memory)",
        "function balanceOf(address owner) public view returns (uint256)",
        "function ownerOf(uint256 tokenId) public view returns (address)",
        "function totalSupply() public view returns (uint256)",
        "function name() public view returns (string memory)",
        "function symbol() public view returns (string memory)"
    ];
    
    const nftState = {
        contract: null,
        contractAddress: localStorage.getItem('omega-nft-contract-v2') || null,
        currentImage: null,
        userNFTs: JSON.parse(localStorage.getItem('omega-user-nfts-v2') || '[]')
    };
    
    // ===================================
    // CONTRACT DEPLOYMENT
    // ===================================
    
    async function deployContract(signer) {
        try {
            window.terminal.log('🚀 Deploying NFT Contract to Omega Network...', 'info');
            window.terminal.log('⏳ Please confirm the transaction...', 'info');
            
            // Deploy contract
            const factory = new ethers.ContractFactory(CONTRACT_ABI, CONTRACT_BYTECODE, signer);
            const contract = await factory.deploy();
            
            window.terminal.log('⏳ Waiting for deployment...', 'info');
            await contract.deployed();
            
            nftState.contractAddress = contract.address;
            nftState.contract = contract;
            
            localStorage.setItem('omega-nft-contract-v2', contract.address);
            
            window.terminal.log('✅ Contract deployed successfully!', 'success');
            window.terminal.log('📝 Contract Address: ' + contract.address, 'output');
            window.terminal.log('🔗 Tx Hash: ' + contract.deployTransaction.hash, 'output');
            
            return contract;
            
        } catch (error) {
            window.terminal.log('❌ Deployment failed: ' + error.message, 'error');
            throw error;
        }
    }
    
    function getContract(signer) {
        // Use the pre-deployed Omega NFT contract
        const contract = new ethers.Contract(OMEGA_NFT_CONTRACT, CONTRACT_ABI, signer);
        return contract;
    }
    
    // ===================================
    // IPFS UPLOAD
    // ===================================
    
    async function uploadToIPFS(file, metadata) {
        try {
            console.log('📤 Upload called with file:', file);
            console.log('File type:', file ? file.type : 'FILE IS NULL');
            console.log('File size:', file ? file.size : 'FILE IS NULL');
            
            if (!file) {
                throw new Error('No file provided');
            }
            
            window.terminal.log('📤 Uploading image to IPFS...', 'info');
            
            // Determine content type
            const contentType = file.type || 'image/png';
            console.log('Using content type:', contentType);
            
            // Upload image to Pinata
            const formData = new FormData();
            formData.append('file', file);
            
            const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${PINATA_JWT}`
                },
                body: formData
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Upload failed: ${response.status} - ${errorText}`);
            }
            
            const data = await response.json();
            const imageCID = data.IpfsHash;
            const imageUrl = `ipfs://${imageCID}`;
            const gatewayUrl = `https://gateway.pinata.cloud/ipfs/${imageCID}`;
            
            window.terminal.log('✅ Image uploaded to Pinata!', 'success');
            window.terminal.log('📤 Creating metadata...', 'info');
            
            // Create metadata JSON
            const metadataJson = {
                name: metadata.name,
                description: metadata.description || '',
                image: imageUrl,
                attributes: metadata.attributes || []
            };
            
            // Upload metadata to Pinata
            const metadataBlob = new Blob([JSON.stringify(metadataJson)], { type: 'application/json' });
            const metadataFile = new File([metadataBlob], 'metadata.json', { type: 'application/json' });
            
            const metadataFormData = new FormData();
            metadataFormData.append('file', metadataFile);
            
            const metadataResponse = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${PINATA_JWT}`
                },
                body: metadataFormData
            });
            
            if (!metadataResponse.ok) {
                throw new Error('Metadata upload failed');
            }
            
            const metadataData = await metadataResponse.json();
            const metadataCID = metadataData.IpfsHash;
            const ipfsUrl = `ipfs://${metadataCID}`;
            
            window.terminal.log('✅ Metadata uploaded!', 'success');
            window.terminal.log('🔗 ' + ipfsUrl, 'output');
            
            return { ipfsUrl, gatewayUrl, cid: metadataCID };
            
        } catch (error) {
            window.terminal.log('❌ IPFS upload failed: ' + error.message, 'error');
            window.terminal.log('💡 Tip: Check your NFT.Storage API key', 'info');
            throw error;
        }
    }
    
    // ===================================
    // ON-CHAIN MINTING
    // ===================================
    
    async function mintOnChain(ipfsUrl, metadata) {
        try {
            // Check for wallet connection
            if (!window.ethereum && !window.provider) {
                throw new Error('Please connect wallet first (type "connect")');
            }
            
            // Get signer from provider
            const provider = window.provider || new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            
            window.terminal.log('⛓️ Minting NFT on Omega Network...', 'info');
            window.terminal.log('📝 Contract: ' + OMEGA_NFT_CONTRACT, 'output');
            
            // Get contract instance
            const contract = getContract(signer);
            
            // Get user address
            const userAddress = await signer.getAddress();
            
            window.terminal.log('⏳ Sending mint transaction...', 'info');
            window.terminal.log('💡 Please confirm in your wallet...', 'info');
            
            // Mint NFT
            const tx = await contract.mint(userAddress, ipfsUrl);
            
            window.terminal.log('⏳ Transaction sent! Waiting for confirmation...', 'info');
            window.terminal.log('🔗 Tx Hash: ' + tx.hash, 'output');
            
            const receipt = await tx.wait();
            
            // Get token ID from event
            let tokenId = '0';
            if (receipt.events && receipt.events.length > 0) {
                const transferEvent = receipt.events.find(e => e.event === 'Transfer');
                if (transferEvent && transferEvent.args) {
                    tokenId = transferEvent.args.tokenId.toString();
                }
            }
            
            window.terminal.log('✅ NFT Minted Successfully!', 'success');
            window.terminal.log('', 'output');
            window.terminal.log('🎨 Token ID: ' + tokenId, 'output');
            window.terminal.log('📝 Contract: ' + OMEGA_NFT_CONTRACT, 'output');
            window.terminal.log('🔗 Tx Hash: ' + tx.hash, 'output');
            window.terminal.log('🌐 IPFS: ' + ipfsUrl, 'output');
            
            // Save to collection
            const nft = {
                tokenId,
                name: metadata.name,
                description: metadata.description,
                contract: OMEGA_NFT_CONTRACT,
                ipfsUrl,
                txHash: tx.hash,
                mintedAt: new Date().toISOString()
            };
            
            nftState.userNFTs.push(nft);
            localStorage.setItem('omega-user-nfts-v2', JSON.stringify(nftState.userNFTs));
            
            return nft;
            
        } catch (error) {
            window.terminal.log('❌ Minting failed: ' + error.message, 'error');
            throw error;
        }
    }
    
    // ===================================
    // UI (Same as before)
    // ===================================
    
    function openMintUI() {
        const existing = document.getElementById('nft-mint-onchain');
        if (existing) existing.remove();
        
        const html = `
            <div id="nft-mint-onchain" style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 90vw;
                max-width: 500px;
                background: linear-gradient(135deg, rgba(18, 18, 18, 0.98), rgba(28, 28, 30, 0.95));
                backdrop-filter: blur(40px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 20px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                z-index: 20000;
                color: white;
                font-family: -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
                padding: 30px;
                max-height: 90vh;
                overflow-y: auto;
            ">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                    <div style="font-size: 1.6em; font-weight: 800;">🎨 Mint NFT</div>
                    <button onclick="closeMintUIOnChain()" style="
                        background: rgba(255, 59, 48, 0.2);
                        color: #FF3B30;
                        border: none;
                        padding: 8px 12px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 1.2em;
                    ">✕</button>
                </div>
                
                <div id="upload-zone-onchain" style="
                    border: 2px dashed rgba(255, 255, 255, 0.3);
                    border-radius: 16px;
                    padding: 40px;
                    text-align: center;
                    margin-bottom: 20px;
                    background: rgba(0, 0, 0, 0.2);
                    cursor: pointer;
                " onclick="document.getElementById('file-input-onchain').click()">
                    <div style="font-size: 3em; margin-bottom: 12px;">🖼️</div>
                    <div style="font-size: 1.1em; font-weight: 600; margin-bottom: 8px;">Upload Image</div>
                    <div style="font-size: 0.9em; opacity: 0.7;">Click to browse or paste (Ctrl+V)</div>
                </div>
                
                <input type="file" id="file-input-onchain" accept="image/*" style="display: none;" onchange="handleFileUploadOnChain(event)">
                
                <div id="preview-zone-onchain" style="display: none; margin-bottom: 20px;">
                    <img id="preview-img-onchain" style="width: 100%; border-radius: 12px; margin-bottom: 12px; max-height: 250px; object-fit: contain; background: rgba(0, 0, 0, 0.3);">
                    <button onclick="clearImageOnChain()" style="width: 100%; background: rgba(255, 59, 48, 0.2); color: #FF3B30; border: none; padding: 10px; border-radius: 10px; cursor: pointer;">🗑️ Remove</button>
                </div>
                
                <div id="form-zone-onchain" style="display: none;">
                    <div style="margin-bottom: 16px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600;">Name</label>
                        <input type="text" id="nft-name-onchain" placeholder="My NFT" style="
                            width: 100%;
                            padding: 12px;
                            border: 1px solid rgba(255, 255, 255, 0.2);
                            border-radius: 12px;
                            background: rgba(28, 28, 30, 0.8);
                            color: white;
                            font-size: 1em;
                            box-sizing: border-box;
                        ">
                    </div>
                    
                    <div style="margin-bottom: 16px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600;">Description (optional)</label>
                        <textarea id="nft-desc-onchain" placeholder="Describe your NFT..." style="
                            width: 100%;
                            padding: 12px;
                            border: 1px solid rgba(255, 255, 255, 0.2);
                            border-radius: 12px;
                            background: rgba(28, 28, 30, 0.8);
                            color: white;
                            font-size: 1em;
                            box-sizing: border-box;
                            min-height: 60px;
                            resize: vertical;
                        "></textarea>
                    </div>
                    
                    <div style="margin-bottom: 16px;">
                        <label style="display: flex; align-items: center; cursor: pointer;">
                            <input type="checkbox" id="add-traits-onchain" onchange="toggleTraitsOnChain()" style="margin-right: 10px; width: 18px; height: 18px;">
                            <span style="font-weight: 600;">Add Traits</span>
                        </label>
                    </div>
                    
                    <div id="traits-zone-onchain" style="display: none; margin-bottom: 16px; background: rgba(0, 0, 0, 0.3); padding: 12px; border-radius: 12px;">
                        <div id="traits-list-onchain"></div>
                        <button onclick="addTraitOnChain()" style="width: 100%; background: rgba(0, 122, 255, 0.2); color: #007AFF; border: 1px solid rgba(0, 122, 255, 0.3); padding: 8px; border-radius: 8px; cursor: pointer; margin-top: 8px;">+ Add Trait</button>
                    </div>
                    
                    <button onclick="mintNFTOnChain()" style="
                        width: 100%;
                        background: linear-gradient(135deg, #34C759, #30D158);
                        color: white;
                        border: none;
                        padding: 16px;
                        border-radius: 12px;
                        cursor: pointer;
                        font-size: 1.1em;
                        font-weight: 700;
                        box-shadow: 0 4px 16px rgba(52, 199, 89, 0.3);
                    ">⛓️ Mint to Omega Network</button>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', html);
        document.addEventListener('paste', handlePasteOnChain);
        
        window.terminal.log('🎨 NFT Minting UI opened', 'success');
        window.terminal.log('💡 Make sure you\'re connected to Omega Network!', 'info');
    }
    
    window.closeMintUIOnChain = function() {
        const ui = document.getElementById('nft-mint-onchain');
        if (ui) ui.remove();
        document.removeEventListener('paste', handlePasteOnChain);
        nftState.currentImage = null;
    };
    
    window.handleFileUploadOnChain = function(event) {
        const file = event.target.files[0];
        if (file) showImageOnChain(file);
    };
    
    function handlePasteOnChain(event) {
        const items = event.clipboardData?.items;
        if (!items) return;
        
        for (let item of items) {
            if (item.type.startsWith('image/')) {
                const file = item.getAsFile();
                if (file) {
                    // Ensure file has a type property
                    if (!file.type) {
                        // Create a new File with proper type
                        const blob = file.slice(0, file.size, item.type);
                        const newFile = new File([blob], file.name || 'pasted-image.png', { type: item.type });
                        showImageOnChain(newFile);
                    } else {
                        showImageOnChain(file);
                    }
                    window.terminal.log('✅ Image pasted', 'success');
                }
                break;
            }
        }
    }
    
    function showImageOnChain(file) {
        // Ensure file has type property
        if (!file.type || file.type === '') {
            window.terminal.log('⚠️ Warning: Image type not detected, assuming PNG', 'warning');
            // Create new file with type
            const blob = file.slice(0, file.size, 'image/png');
            nftState.currentImage = new File([blob], file.name || 'image.png', { type: 'image/png' });
        } else {
            nftState.currentImage = file;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('upload-zone-onchain').style.display = 'none';
            document.getElementById('preview-zone-onchain').style.display = 'block';
            document.getElementById('preview-img-onchain').src = e.target.result;
            document.getElementById('form-zone-onchain').style.display = 'block';
            
            window.terminal.log('✅ Image loaded: ' + file.name, 'success');
        };
        reader.readAsDataURL(file);
    }
    
    window.clearImageOnChain = function() {
        nftState.currentImage = null;
        document.getElementById('upload-zone-onchain').style.display = 'block';
        document.getElementById('preview-zone-onchain').style.display = 'none';
        document.getElementById('form-zone-onchain').style.display = 'none';
    };
    
    let traitCountOnChain = 0;
    
    window.toggleTraitsOnChain = function() {
        const checked = document.getElementById('add-traits-onchain').checked;
        const zone = document.getElementById('traits-zone-onchain');
        zone.style.display = checked ? 'block' : 'none';
        if (checked && document.getElementById('traits-list-onchain').children.length === 0) {
            addTraitOnChain();
        }
    };
    
    window.addTraitOnChain = function() {
        const id = traitCountOnChain++;
        const html = `
            <div id="trait-onchain-${id}" style="display: flex; gap: 8px; margin-bottom: 8px;">
                <input type="text" placeholder="Type" class="trait-type-onchain" style="flex: 1; padding: 8px; border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; background: rgba(28, 28, 30, 0.8); color: white; font-size: 0.9em;">
                <input type="text" placeholder="Value" class="trait-value-onchain" style="flex: 1; padding: 8px; border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; background: rgba(28, 28, 30, 0.8); color: white; font-size: 0.9em;">
                <button onclick="removeTraitOnChain(${id})" style="background: rgba(255, 59, 48, 0.2); color: #FF3B30; border: none; padding: 8px 12px; border-radius: 8px; cursor: pointer;">🗑️</button>
            </div>
        `;
        document.getElementById('traits-list-onchain').insertAdjacentHTML('beforeend', html);
    };
    
    window.removeTraitOnChain = function(id) {
        const el = document.getElementById(`trait-onchain-${id}`);
        if (el) el.remove();
    };
    
    function getTraitsOnChain() {
        const traits = [];
        document.querySelectorAll('#traits-list-onchain > div').forEach(div => {
            const type = div.querySelector('.trait-type-onchain')?.value.trim();
            const value = div.querySelector('.trait-value-onchain')?.value.trim();
            if (type && value) {
                traits.push({ trait_type: type, value: value });
            }
        });
        return traits;
    }
    
    window.mintNFTOnChain = async function() {
        try {
            if (!nftState.currentImage) {
                window.terminal.log('❌ Please upload an image', 'error');
                return;
            }
            
            const name = document.getElementById('nft-name-onchain')?.value.trim();
            if (!name) {
                window.terminal.log('❌ Please enter a name', 'error');
                return;
            }
            
            const description = document.getElementById('nft-desc-onchain')?.value.trim();
            const attributes = document.getElementById('add-traits-onchain')?.checked ? getTraitsOnChain() : [];
            
            // Store the file reference BEFORE closing UI
            const imageFile = nftState.currentImage;
            
            closeMintUIOnChain();
            
            window.terminal.log('🎨 Starting NFT minting process...', 'info');
            window.terminal.log('📝 Name: ' + name, 'output');
            window.terminal.log('', 'output');
            
            // Upload to IPFS using stored file reference
            const ipfs = await uploadToIPFS(imageFile, {
                name,
                description,
                attributes
            });
            
            // Mint on-chain
            const nft = await mintOnChain(ipfs.ipfsUrl, {
                name,
                description
            });
            
            window.terminal.log('', 'output');
            window.terminal.log('🎉 Success! Your NFT is now on Omega Network!', 'success');
            window.terminal.log('', 'output');
            window.terminal.log('💡 Use "nft collection" to view all your NFTs', 'info');
            
        } catch (error) {
            window.terminal.log('❌ Minting failed: ' + error.message, 'error');
        }
    };
    
    // ===================================
    // COLLECTION
    // ===================================
    
    function showCollection() {
        if (nftState.userNFTs.length === 0) {
            window.terminal.log('📭 No NFTs minted yet', 'info');
            window.terminal.log('💡 Use "nft mint" to create your first NFT!', 'info');
            return;
        }
        
        window.terminal.log('🎨 Your NFT Collection:', 'info');
        window.terminal.log('', 'output');
        
        nftState.userNFTs.forEach((nft, i) => {
            window.terminal.log(`${i + 1}. ${nft.name} (Token #${nft.tokenId})`, 'output');
            window.terminal.log(`   Contract: ${nft.contract}`, 'output');
            window.terminal.log(`   Tx Hash: ${nft.txHash}`, 'output');
            window.terminal.log(`   Minted: ${new Date(nft.mintedAt).toLocaleString()}`, 'output');
            window.terminal.log('', 'output');
        });
    }
    
    function viewNFT(index) {
        const nft = nftState.userNFTs[index - 1];
        if (!nft) {
            window.terminal.log('❌ NFT not found', 'error');
            return;
        }
        
        window.terminal.log('🎨 NFT Details:', 'info');
        window.terminal.log('', 'output');
        window.terminal.log('Name: ' + nft.name, 'output');
        if (nft.description) window.terminal.log('Description: ' + nft.description, 'output');
        window.terminal.log('Token ID: ' + nft.tokenId, 'output');
        window.terminal.log('Contract: ' + nft.contract, 'output');
        window.terminal.log('IPFS: ' + nft.ipfsUrl, 'output');
        window.terminal.log('Tx Hash: ' + nft.txHash, 'output');
        window.terminal.log('Minted: ' + new Date(nft.mintedAt).toLocaleString(), 'output');
    }
    
    function showContractInfo() {
        if (nftState.contractAddress) {
            window.terminal.log('📝 NFT Contract Address:', 'info');
            window.terminal.log(nftState.contractAddress, 'output');
        } else {
            window.terminal.log('❌ No contract deployed yet', 'error');
            window.terminal.log('💡 Use "nft mint" to deploy and mint your first NFT', 'info');
        }
    }
    
    // ===================================
    // COMMANDS
    // ===================================
    
    window.handleNFTMintCommand = function(args) {
        const cmd = args[0]?.toLowerCase();
        
        switch (cmd) {
            case 'mint':
                openMintUI();
                break;
                
            case 'collection':
            case 'list':
                showCollection();
                break;
                
            case 'view':
                const index = parseInt(args[1]);
                if (!index || isNaN(index)) {
                    window.terminal.log('❌ Usage: nft view <number>', 'error');
                } else {
                    viewNFT(index);
                }
                break;
                
            case 'contract':
                showContractInfo();
                break;
                
            case 'help':
                window.terminal.log('🎨 NFT Minter Commands:', 'info');
                window.terminal.log('', 'output');
                window.terminal.log('  nft mint       - Mint new NFT on-chain', 'output');
                window.terminal.log('  nft collection - View your NFTs', 'output');
                window.terminal.log('  nft view <#>   - View NFT details', 'output');
                window.terminal.log('  nft contract   - Show contract address', 'output');
                window.terminal.log('', 'output');
                window.terminal.log('✨ NFTs are minted on Omega Network!', 'info');
                break;
                
            default:
                openMintUI();
        }
    };
    
    console.log('✅ Omega NFT On-Chain Minter loaded!');
    
})();
